/**
 * Validações client-side amigáveis para o Portal do Laboratório de TI
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Confirmação amigável de exclusão para qualquer formulário de exclusão
  const formsExclusao = document.querySelectorAll("form[action*='/excluir']");
  formsExclusao.forEach(form => {
    form.addEventListener("submit", (e) => {
      const confirmacao = window.confirm("Atenção: Tem certeza de que deseja excluir este registro?");
      if (!confirmacao) {
        e.preventDefault();
      }
    });
  });

  // 2. Validação de quantidade (não permitir números negativos)
  const inputQtd = document.getElementById("quantidade") || document.querySelector("input[name='quantidade']");
  if (inputQtd) {
    inputQtd.addEventListener("input", () => {
      const val = parseInt(inputQtd.value, 10);
      if (val < 0) {
        inputQtd.setCustomValidity("A quantidade não pode ser um número negativo.");
      } else {
        inputQtd.setCustomValidity("");
      }
    });
  }

  // 3. Validação de data de reserva (definir data mínima como a data de hoje)
  const inputData = document.getElementById("data_reserva") || document.querySelector("input[name='data_reserva']");
  if (inputData) {
    const hojeStr = new Date().toISOString().split("T")[0];
    inputData.setAttribute("min", hojeStr);

    inputData.addEventListener("change", () => {
      if (inputData.value && inputData.value < hojeStr) {
        alert("Aviso: Você selecionou uma data retroativa. Recomenda-se selecionar a data de hoje ou futura.");
      }
    });
  }
});
