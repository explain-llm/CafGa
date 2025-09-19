from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import torch.nn as nn
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

cache_dir = os.getenv("HUGGINGFACE_CACHE")

allowed_models = [
    "google/flan-t5-large",
]
# Stores which tokenizer to use for which model
model_name_to_tokenizer = {
    "google/flan-t5-large": "google/flan-t5-large",
}
model_name_to_class = {
    "google/flan-t5-large": AutoModelForSeq2SeqLM,
}


class GenerativeModel:
    def __init__(self, model_name: str):
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name_to_tokenizer[model_name], cache_dir=cache_dir
        )
        self.model = model_name_to_class[model_name].from_pretrained(
            model_name, cache_dir=cache_dir, device_map="auto"
        )

    def generate(self, *args):
        return self.model.generate(*args)

    def get_logprobability(self, input_ids, target_ids):
        """Get the log probability of the target sequence given the input sequence."""
        loss_fct = nn.NLLLoss(reduction="none")
        lsm = nn.LogSoftmax(dim=1)  # first applies the softmax to ensure all values are normalized
        self.model.eval()
        with torch.no_grad():
            output = self.model(
                input_ids=input_ids,
                labels=target_ids,
            )
        # print("Output logits_shape: ", output.logits.shape)
        logits = output.logits
        lsm_logits = lsm(logits)
        # Gather the log probabilities associated with the token ids given by target_ids
        log_probs = lsm_logits.gather(2, target_ids.unsqueeze(-1)).squeeze(-1)
        summed_log_probs = log_probs.sum(1)
        # Convert to numpy array for SHAP
        summed_log_probs = summed_log_probs.to("cpu").numpy()
        return summed_log_probs

    def get_tokens_and_groups_from_continuous_spans(self, spans: list[str], add_eos=False):
        input_tokens = []
        span_indices = []
        current_index = 0
        for span in spans:
            sent_tokens = self.tokenizer(
                span, return_tensors="pt", add_special_tokens=False
            ).input_ids[0]
            # add_special_tokens=False to avoid adding eos token
            input_tokens.extend(sent_tokens)
            span_indices.extend([current_index] * len(sent_tokens))
            current_index += 1

        if add_eos:
            input_tokens.append(self.tokenizer.eos_token_id)
            span_indices.append(current_index - 1)
        return torch.stack(input_tokens), span_indices

    def tokenize(self, text: str):
        return self.tokenizer(text, return_tensors="pt", add_special_tokens=False).input_ids[0]

    def decode(self, tokens):
        return self.tokenizer.decode(tokens)
