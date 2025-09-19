FROM python:3.11

COPY ./ /srv/backend

WORKDIR /srv/backend
RUN pip3 install --no-cache-dir -r requirements.txt
# RUN python -m spacy download en_core_web_trf
# RUN pip3 install numpy==1.26.4

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]