var radioHearts = document.querySelectorAll('.voteCardTitle');
var loadingBtns = document.querySelectorAll('.loadingBtns')
//Exit Flash Message
$('.exitFlash').click(() => {
    $('.flashMsg').css({"display": "none"});
    $('.moveForm').css({"margin": "50px auto"})
});

//Register Modal
$('.regJudge').click(() => {
    $('.ui.modal').modal();
});

$('#hybrid')
  .dropdown({
    on: 'hover'
});
// Modal
$('.registerJudgeBtn').click(()=>{
    $('#registerJudgeModal')
  .modal('show');
});
$('.registerBoothBtn').click(()=>{
    $('#registerBoothModal')
  .modal('show');
});
$('.registerQrBtn').click(()=>{
    $('#registerQrModal')
  .modal('show');
});
$('.regCanBtn').click(()=>{
    $('.ui.modal')
  .modal('hide');
});
$('.addBtn').click(()=>{
    $('#addModal')
  .modal('show');
});

$('.deleteBtn').click(()=>{
    $('#deleteModal')
  .modal('show');
});
//toogle radio heart color

function removeRadioIcons(){
    radioHearts.forEach((radioHeart) => {
        radioHeart.classList.remove('radioIcon');
    });
}
radioHearts.forEach((elm) => {
    elm.addEventListener('click', () => {
        removeRadioIcons();
        elm.classList.add('radioIcon');
    });
});


//Set Loading on button
function removeLoadingBtns(){
    loadingBtns.forEach((loadingBtn) => {
        loadingBtn.classList.remove('loading')
    })
}
loadingBtns.forEach((elm) => {
    elm.addEventListener('click', () => {
        removeLoadingBtns();
        elm.classList.add('loading');
    });
});