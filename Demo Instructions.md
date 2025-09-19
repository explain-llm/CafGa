# CafGa Demo

The following describes how to run the demo.ipynb notebook and the widgets available in CafGa. 

## Prerequisites 

1. Downloaded the requirments for CafGa (not necessary if you downloaded cafga via pip)
2. Have an environment that can run notebooks and render javascript output as jupyter widgets.
    - Remark: The code was written and tested with VSCode. 
3. (Optional) If you wish to use the predefined chatgpt model, please provide a .env file with the OPENAI_API_KEY in your working directory (where you have the notebook). 

## Setup

1. Download the demo directory from the repository and replace the demo directory inside the cafga site package directory with this demo directory. You should replace the top-level demo directory that is in the folder with the cafga.py file. 

2. Download npm. With npm installed navigate to the demo directory in your commandline and run

```
npm install 
```

3. Install the following additional packages in this order.
```
pip install -U jupyterlab ipywidgets jupyterlab-widgets
pip install anywidget
```
4. (Optional) Restart your IDE 
    - Remark: Even with steps 1. and 2. completed you may encounter a javascript error when running the widget cells. But, restarting the IDE should resolve that problem. 