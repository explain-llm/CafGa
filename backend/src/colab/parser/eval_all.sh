# the evaluation is single-threaded so feel free to run in parallel

python3 colab/parser/eval_grammaticality.py --dataset med > eval_med_rc0.log
python3 colab/parser/eval_grammaticality.py --dataset legal > eval_leg_rc0.log
python3 colab/parser/eval_grammaticality.py --dataset finance > eval_fin_rc0.log
python3 colab/parser/eval_grammaticality.py --dataset education > eval_edu_rc0.log
python3 colab/parser/eval_grammaticality.py --dataset news > eval_nws_rc0.log
