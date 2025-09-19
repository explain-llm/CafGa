from openai import OpenAI
import warnings
import pickle
import os
from os.path import join as pjoin
import hashlib
import dotenv
import threading

class ChatGPT:
    def __init__(
        self, model = "gpt-4o-mini", fixed_prompt=None, n_samples=5, max_tokens=100, temperature=None, cache_dir=None
    ):
        """
        Parameters
        ----------
        model : str
            The model to use for the responses. The string needs to already be formatted correctly. Default is "gpt-4o-mini".
        fixed_prompt : str
            The prompt to use for all the responses. Default is None.
        n_samples : int
            The number of responses sampled for each input. Default is 5.
        max_tokens : int
            The maximum number of tokens to generate. Default is 100.
        cache_dir : str
            The directory to cache the responses. Default is None. If set to None responses will not be cached.
        """
        dotenv.load_dotenv()
        self.client = OpenAI()
        self.model = model
        cache_dir = cache_dir + "-" + model if cache_dir else None
        self.prompt = fixed_prompt
        self.n_samples = n_samples
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.template: str = None
        self.cache_dir = cache_dir
        self.hasher = hashlib.sha256()
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
        self.call_index = 0

    def set_prompt(self, prompt):
        self.prompt = prompt

    # def set_question(self, question):
    #     """Provide a question after the prompt."""
    #     self.question = question

    def set_template(self, template: str):
        """Defines the template into which the input is inserted. The template should contain a placeholder for the input in the form {input}."""
        self.template = template

    def __call__(
        self,
        input_string: str,
        n_samples: int = None,
        max_tokens: int = None,
    ):
        # print("Calling chatgpt ")
        set_empty_if_none = lambda x: "" if x is None else x
        n_samples = n_samples if n_samples else self.n_samples
        max_tokens = max_tokens if max_tokens else self.max_tokens
        if not self.template:
            warnings.warn(
                "Template not set. Please set template before calling get_response. (Using empty template instead)"
            )
            self.template = "{input}"

        # input_placeholder = "{input}" perhaps use regex in future

        content = self.template.replace("{input}", input_string)
        self.hasher.update(content.encode())
        content_hash = self.hasher.hexdigest()
        self.hasher = hashlib.sha256()  # Reset the hasher

        cache_path = pjoin(self.cache_dir, f"{content_hash}.pkl")
        if self.cache_dir is not None and os.path.exists(cache_path):
            # print(f"Fetching from cache. {self.call_index}")
            completion = pickle.load(open(cache_path, "rb"))
        else:
            # print(f"Fetching from API. {self.call_index}")
            # print("Content: ", content)
            # raise Exception("API not available")
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": content,
                    },
                ],
                logprobs=False,
                n=n_samples,
                max_tokens=max_tokens,
                temperature=self.temperature,
            )
            if self.cache_dir:
                pickle.dump(completion, open(cache_path, "wb"))
        self.call_index += 1
        responses = []
        for choice in completion.choices:
            try:
                responses.append(choice.message.content.lower())
            except Exception as e:
                print("Got the following error while getting a response from the API:")
                print(e)
                print("Message in question: ", choice.message)
                print("Content in question: ", content)
        print(
            f"\nThread: {threading.current_thread().ident} on action {self.call_index}\nInput:\n",
            input_string,
            f"\nThread: {threading.current_thread().ident} on action {self.call_index}\nResponses: ",
            responses,
            "\n",
        )
        return responses
