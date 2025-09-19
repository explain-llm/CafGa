import json
import os

from colab.utils.constant import DATA_DIR


def load_sample_task(task_id):
    with open(os.path.join(
            DATA_DIR, 'sample-task', task_id+'.json')) as f:
        task = json.load(f)
    return task


def load_experiment_index(task_id):
    try:
        with open(os.path.join(
                DATA_DIR, 'experiments', task_id, 'index.json')) as f:
            index = json.load(f)
    except FileNotFoundError:
        index = []
    return index


def save_experiment_index(task_id, index):
    task_dir = os.path.join(DATA_DIR, 'experiments', task_id)
    os.makedirs(task_dir, exist_ok=True)
    with open(os.path.join(task_dir, 'index.json'), 'w') as f:
        json.dump(index, f)


def get_task_id(exp_config):
    return exp_config['task_id'] + '-' + exp_config['task_version']


def get_experiment_id(exp_config):
    task_id = get_task_id(exp_config)
    index = load_experiment_index(task_id)

    def contain(l1, l2):
        for e2 in l2:
            if not (any([constraint_equal(e1, e2) for e1 in l1])
                    or constraint_equal({}, e2)):
                return False
        return True

    def constraint_equal(c1, c2):
        if c1.get('collapsed', False) != c2.get('collapsed', False):
            print('collapsed not equal')
            return False
        if c1.get('value', None) != c2.get('value', None):
            print('value not equal')
            return False
        c1options = c1.get('options', [])
        c2options = c2.get('options', [])
        if len(set([*c1options, *c2options])) != len(c1options):
            print('option not equal')
            return False
        return True

    def constraints_equal(c1, c2):
        c1 = [] if c1 is None else c1
        c2 = [] if c2 is None else c2
        return contain(c1, c2) and contain(c2, c1)

    def config_equal(config1, config2):
        keys = ['task_id', 'task_version', 'instruction',
                'sampling', 'max_queries', 'n_samples']
        return all([config1[k] == config2[k] for k in keys]) \
            and constraints_equal(
                config1.get('constraints'),
                config2.get('constraints')
        )

    saved_config = next((config for config in index
                         if config_equal(config, exp_config)), None)

    if saved_config is None:
        return None
    else:
        return saved_config['exp_id']


def get_exp_uuid(old_ids):
    # TODO: implement a more robust uuid generator
    return f'exp-{len(old_ids)}'


def save_experiment(exp_config, exp, overwrite=False):
    task_id = get_task_id(exp_config)
    exp_id = get_experiment_id(exp_config)
    index = load_experiment_index(task_id)

    if exp_id is not None:
        if not overwrite:
            raise ValueError("The experiment already exists.")
    else:
        exp_id = get_exp_uuid([saved_exp_config['exp_id']
                               for saved_exp_config in index])
        index.append({**exp_config, "exp_id": exp_id})

    save_experiment_index(task_id, index)
    with open(os.path.join(
            DATA_DIR, 'experiments', task_id, exp_id+'.json'), 'w') as f:
        json.dump(exp, f)


def load_experiment(exp_config):
    task_id = get_task_id(exp_config)
    exp_id = get_experiment_id(exp_config)

    if exp_id is None:
        return None

    with open(os.path.join(
            DATA_DIR, 'experiments', task_id, exp_id+'.json')) as f:
        exp = json.load(f)
    return exp
