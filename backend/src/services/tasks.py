import os
from os.path import join as pjoin
import concurrent
import numpy as np
from ..models.openai import ChatGPT
from ..datatypes.text import Operator, Task
from src.services.scalarizers import evaluate_outcome, NLI_fns
from src.gale.explainer.GroupExplainer import GroupExplainer as Explainer
from src.gale.evaluator.GroupEvaluator import GroupEvaluator as Evaluator

openai_cache_dir = pjoin(os.path.dirname(os.path.abspath(__file__)), "..", "..", "OpenAICache")
n_threads = 20
n_allowed_samples = 400
n_allowed_samples_with_NLI = 128
n_responses = 10
n_responses_with_NLI = 1
max_tokens = 100
max_tokens_with_NLI = 1000
class TaskHandler:
    def __init__(self, model_to_explain):
        global n_threads
        if "nano" in model_to_explain or "mini" in model_to_explain or "turbo" in model_to_explain:
            n_threads = 20
        else:
            n_threads = 4
        os.makedirs(openai_cache_dir, exist_ok=True)
        self.model = ChatGPT(
            model=model_to_explain,
            n_samples=n_responses,
            max_tokens=max_tokens,
            temperature=1.0,
            cache_dir=openai_cache_dir,
        )
        self.model_wrapper = self.model_wrapper_parallelized
        self.explainer = Explainer(model=self.model_wrapper)
        self.NLI_model = None

    def process_sample(self, *args):
        input_string = args[0][0]
        sample_index = args[0][1]
        responses = self.model(input_string)
        self.results[sample_index] = evaluate_outcome(
            responses, {"operator": self.operator.value, "value": self.target}, self.NLI_model
        )

    def model_wrapper_parallelized(self, input_strings: list[list[str]]):
        self.results = np.zeros(len(input_strings))
        samples = [(input_strings[i], i) for i in range(len(input_strings))]
        with concurrent.futures.ThreadPoolExecutor(max_workers=n_threads) as executor:

            futures = {executor.submit(self.process_sample, sample): sample for sample in samples}
            for future in concurrent.futures.as_completed(futures):
                future.result()
                del futures[future]  # Crucial to close memory leaks
        return self.results

    def set_environment(self, sample_index):
        """Updates the template and the operator"""
        self.target = self.sample_table[sample_index][0]
        template = self.sample_table[sample_index][1]
        self.operator = self.sample_table[sample_index][2]
        if self.operator.value in NLI_fns:
            self.model.n_samples = n_responses_with_NLI
            self.n_allowed_samples = n_allowed_samples_with_NLI
        else:
            self.model.n_samples = n_responses
            self.n_allowed_samples = n_allowed_samples
        if self.operator.value in NLI_fns and self.NLI_model is None:
            from transformers import pipeline
            print("Received NLI operator --> instantiate NLI model")
            self.NLI_model = pipeline(
                "text-classification", model="tasksource/deberta-small-long-nli"
            )

        self.model.set_template(template)

    def get_attributions(
        self,
        task: Task,
        assignments: list[int],
    ):
        if task.operator.value in NLI_fns:
            print("Received NLI operator --> instantiate NLI model")
            from transformers import pipeline
            self.NLI_model = pipeline(
                "text-classification", model="tasksource/deberta-small-long-nli"
            )
            self.model.n_samples = n_responses_with_NLI
            self.n_allowed_samples = n_allowed_samples_with_NLI
            self.model.max_tokens = max_tokens_with_NLI
        else:
            self.model.n_samples = n_responses
            self.n_allowed_samples = n_allowed_samples
            self.model.max_tokens = max_tokens
        original_prediction, scalarized = self.get_original_prediction(task, evaluate_response=False)
        if task.target == "{model}":
            response_counts = {}
            for response in original_prediction:
                if response in response_counts:
                    response_counts[response] += 1
                else:
                    response_counts[response] = 1
            most_frequent_response = max(response_counts, key=response_counts.get)
            task.target = most_frequent_response
            scalarized = evaluate_outcome(
                original_prediction, {"operator": task.operator.value, "value": task.target}, self.NLI_model
            )

        input = task.inputSegments
        template = task.template
        target = task.target
        operator = task.operator
        self.model.set_template(template)
        self.target = target
        self.operator = operator

        attributions, computation_time, n_generated_samples = self.explainer(
            input,
            assignments,
            mask_value="",
            merge_masks=True,
            n_allowed_samples=self.n_allowed_samples,
            track_execution_data=True,
        )
        # Add the scalarized value to the original responses as a string
        original_prediction.append(str(scalarized))
        print("Computed attributions")
        return attributions, original_prediction, computation_time, n_generated_samples

    def get_evaluation(
        self,
        input_list: list[list[str]],
        assignments_list: list[list[int]],
        template_list: list[str],
        attributions_list: list[list[float]],
        target_list: list[str],
        operator_list: list[Operator],
        direction: str,
    ):

        self.sample_table = []
        for i in range(len(input_list)):
            self.sample_table.append((target_list[i], template_list[i], operator_list[i]))
        evaluator = Evaluator(
            self.model_wrapper,
            input_list,
            assignments_list,
            attributions_list,
            mask_value="",
            merge_masks=True,
            environment_setup_hook=self.set_environment,
        )
        differences = evaluator.evaluate(direction, step_size=1, cut_off=1.0, flips_signs=True)
        return differences

    def get_original_prediction(self, task: Task, evaluate_response: bool = False):
        self.model.set_template(task.template)
        responses = self.model("".join(task.inputSegments))
        scalarized = evaluate_outcome(
            responses, {"operator": task.operator.value, "value": task.target}, self.NLI_model
        )
        if evaluate_response:
            return scalarized
        return responses, scalarized
