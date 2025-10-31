# CafGa Demo

The following describes how to run the demo.ipynb notebook and the widgets available in CafGa. 

## Prerequisites 

1. Downloaded the requirments for CafGa (not necessary if you downloaded cafga via pip)
2. Have an environment that can run notebooks and render javascript output as jupyter widgets.
    - Remark: The code was written and tested with VSCode. 
3. (Optional) If you wish to use the predefined chatgpt model, please provide a .env file with the OPENAI_API_KEY in your working directory (where you have the notebook). 

## Instillation

1. (For those who download cafga as a pypi package) If you download cafga via pip you will still need to add the java script files. 
    1. **Download the demo directory**:
        From the [repository](https://github.com/explain-llm/CafGa) download the demo directory at src/cafga/demo.
    2. **Navigate to the cafga package in site-packages**:
    If you are using a environment manager like [conda](https://anaconda.org/anaconda/conda), the path to the cafga directory should look like this: \*path_to_envs_directory\*/\*environment name\*/lib/python\*version number\*/site-packages/cafga
    3. **Add the demo directory to the site package**: In the cafga directory replace the existing demo folder with the one downloaded from the repository. The resulting folder structure should look like this:
    ```
    .
    └── cafga/
        ├── \_\_init\_\_.py
        ├── cafga.py
        ├── config.py
        ├── containers.py
        ├── util.py
        ├── models
        └── demo/
            ├── js
            ├── node_modules (after step 2)
            ├── src
            ├── package-lock.json
            ├── package.json
            └── tsconfig.json
    ```




2. **Install packages**: First install [npm](https://www.npmjs.com/). Then with npm installed navigate to the demo directory in your commandline and run

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