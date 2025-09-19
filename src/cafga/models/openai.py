from openai import OpenAI
import warnings
import pickle
import os
from os.path import join as pjoin
import hashlib
import dotenv


class ChatGPT:
    def __init__(
        self, n_responses=5, max_tokens=100, temperature=None, cache_dir=None
    ):
        """
        Parameters
        ----------
        n_responses : int
            The number of responses sampled for each input. Default is 5.
        max_tokens : int
            The maximum number of tokens to generate. Default is 100.
        cache_dir : str
            The directory to cache the responses. Default is None. If set to None responses will not be cached.
        """
        dotenv.load_dotenv()
        self.client = OpenAI()
        self.n_responses = n_responses
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.template: str = None
        self.cache_dir = cache_dir
        self.hasher = hashlib.sha256()
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
        self.call_index = 0

    def set_template(self, template: str):
        """Defines the template into which the input is inserted. The template should contain a placeholder for the input in the form {input}."""
        self.template = template
    
    def get_template(self):
        return self.template

    def __call__(
        self,
        input_string: str,
        n_responses: int = None,
        max_tokens: int = None,
    ):
        n_responses = n_responses if n_responses else self.n_responses
        max_tokens = max_tokens if max_tokens else self.max_tokens
        if not self.template:
            warnings.warn(
                "Template not set. Please set template before calling get_response. (Using empty template instead)"
            )
            self.template = "{input}"

        content = self.template.replace("{input}", input_string)
        self.hasher.update(content.encode())
        content_hash = self.hasher.hexdigest()
        self.hasher = hashlib.sha256()  # Reset the hasher

        if self.cache_dir is not None:
            cache_path = pjoin(self.cache_dir, f"{content_hash}.pkl")
            if os.path.exists(cache_path):
                completion = pickle.load(open(cache_path, "rb"))
        else:
            completion = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": content,
                    },
                ],
                logprobs=False,
                n=n_responses,
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
        # print("Responses: ", responses)
        return responses
