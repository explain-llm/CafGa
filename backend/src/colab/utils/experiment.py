import pandas as pd

from colab.sampler.sampler import get_mutable
from colab.sampler.recover import recover_text_from_node
from colab.utils.set import flatten


def exps2df(task, constraints, exps):
    nodes = task['spec']['nodes']
    span_dict = {
        span['id']: span
        for span in task['spec']['spans']
    }
    def get_node(x): return nodes[x]
    raw_column_nodes = get_column_nodes(
        nodes, constraints=constraints)
    raw_column_names = get_set_column_names(
        span_dict, get_node, raw_column_nodes
    )
    column_names = []
    column_nodes = []
    for name, nodes in zip(raw_column_names, raw_column_nodes):
        if name is not None:
            column_names.append(name)
            column_nodes.append(nodes)
            
    column_names += get_outcome_column_names(
        task['outcomes']
    )
    rows = get_rows(exps, column_nodes)
    return pd.DataFrame(rows, columns=column_names)


def get_column_nodes(nodes, constraints=None):
    if constraints is not None:
        for constraint in constraints:
            nodes[constraint['id']].update(constraint)

    def get_node(x): return nodes[x]
    roots = [i for i, node in enumerate(nodes)
             if node.get('parent') == None]
    mutable_nodes = flatten([
        get_mutable(get_node, root) for root in roots])
    return mutable_nodes


def get_set_column_names(span_dict, get_node, column_nodes):
    return [
        recover_text_from_node(
            span_dict, get_node, hset[0], hset, check_necessity=False)
        for hset in column_nodes
    ]


def get_outcome_column_names(outcomes):
    return [' '.join([outcome['operator'], outcome['value']])
            for outcome in outcomes]


def get_rows(exps, column_nodes):
    rows = []
    for exp in exps:
        row = ([all([e in exp['set'] for e in hset])
                for hset in column_nodes])
        for outcome in exp['outcomes']:
            row.append(sum(outcome)/len(outcome))
        rows.append(row)
    return rows


def agg(df, agg_by, agg_method='mean', sort=True, ascending=False):
    if type(agg_by) == str:
        agg_by = [agg_by]
    df = df.groupby(agg_by)
    if agg_method == 'mean':
        df = df.mean()
    elif agg_method == 'min':
        df = df.min()
    elif agg_method == 'max':
        df = df.max()
    elif agg_method == 'median':
        df = df.median()
    else:
        raise ValueError
    if sort:
        columns = df.columns
        return df.sort_values(
            by=columns[-1], ascending=ascending)
