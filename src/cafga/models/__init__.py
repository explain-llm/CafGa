from .openai import ChatGPT
import numpy as np
import concurrent
class ParallelizedModel:
    def __init__(self, model, n_threads):
        self.model = model
        self.n_threads = n_threads

    def single(self, *args):
        single_input, input_index = args[0]
        prediction = self.model(single_input)
        self.results[input_index] = prediction

    def __call__(self, input_list):
        """
        For the list of inpiut call the model and return all the string responses.
        """
        self.results = [None] * len(input_list)
        samples = [(input_list[i], i) for i in range(len(input_list))]
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.n_threads) as executor:
            futures = {executor.submit(self.single, sample): sample for sample in samples}
            for future in concurrent.futures.as_completed(futures):
                future.result()
                del futures[future]  # Crucial to close memory leaks
        return self.results

    def set_template(self, template):
        self.model.set_template(template)

    def get_template(self):
        return self.model.template

def load_model(model_name, **kwargs):
    match model_name.lower():
        case "chatgpt":
            n_responses = kwargs["n_responses"] if "n_responses" in kwargs else 8
            n_threads = kwargs["n_threads"] if "n_threads" in kwargs else 4
            temperature = kwargs["temperature"] if "temperature" in kwargs else 1.0
            max_tokens = kwargs["max_tokens"] if "max_tokens" in kwargs else 250
            cache_dir = kwargs["cache_dir"] if "cache_dir" in kwargs else None
            return ParallelizedModel(
                ChatGPT(n_responses=n_responses, max_tokens=max_tokens, temperature=temperature, cache_dir=cache_dir),
                n_threads,
            )
        case _ : raise ValueError(f"Model {model_name} not supported")
