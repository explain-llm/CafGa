import errno, os, signal, functools


class TimeoutException(Exception):
    pass


def timeout(seconds, error_message=os.strerror(errno.ETIME)):
    def decorator(func):
        def _handle_timeout(signum, frame):
            raise TimeoutException(error_message)

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            signal.signal(signal.SIGALRM, _handle_timeout)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result

        return wrapper

    return decorator


def get_dataset(dataset):
    from datasets import load_dataset
    import itertools
    import nltk

    if dataset == "med":
        data = load_dataset("bigbio/med_qa", "med_qa_en_4options_bigbio_qa")[
            "train"
        ].select(range(150))["question"]
    elif dataset == "legal":
        data = load_dataset("billsum")["train"].select(range(500))["summary"]
    elif dataset == "finance":
        data = load_dataset("gbharti/finance-alpaca")["train"].select(range(130))["output"]
    elif dataset == "education":
        data = load_dataset("nampdn-ai/tiny-textbooks")["train"].select(range(120))["text"]
    elif dataset == "news":
        data = load_dataset("multi_news")["train"].select(range(20))["document"]
    else:
        raise Exception("Unknown dataset")

    for line_i, line in enumerate(data):
        # print("SEGMENT", line_i + 1)
        # fancy overshadowing
        lines = [
            line
            for line in line.split("\n")
            for line in nltk.tokenize.sent_tokenize(line)
        ]
        for line in lines:
            # no questions
            if line.strip().endswith("?"):
                continue
            sent_len = len(line.split())
            # disregard too short or too long sentences
            if sent_len < 3 or sent_len > 30:
                continue
            # otherwise yield
            yield line.strip()
