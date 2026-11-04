# State remoto: o state precisa sobreviver entre as execuções do pipeline.
# Este modelo usa o backend "http", compatível com o estado gerenciado do
# GitLab (conta gratuita). Os parâmetros chegam pelas variáveis TF_HTTP_*,
# definidas nos workflows a partir dos secrets do GitHub (veja o README).
#
# Se o professor escolher outro backend (por exemplo, S3), troque somente
# este arquivo e as variáveis de ambiente dos workflows.
terraform {
  backend "http" {}
}
