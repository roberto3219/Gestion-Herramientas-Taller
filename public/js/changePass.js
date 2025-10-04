 window.addEventListener("load",function (){
        const erroresList = document.querySelector("errores")
        const currentPass = document.querySelector("currentPassword1")
        const changePassForm = document.querySelector("form-change-pass")
        const changePass = document.querySelector("newPassword1")
        const repassPass = document.querySelector("confirmPassword1")

        changePassForm.addEventListener("submit",function(e){
          errores = []
          if(currentPass.value == "" ||
            currentPass.value == null ||
            currentPass.value == undefined
          ){
            errores.push("Campo Contraseña obligatorio")
          }else if(currentPass.value.length < 6){
            errores.push("Debe tener por lo menos 6 caracteres")
          }

          if(changePass.value == "" ||
            changePass.value == null ||
            changePass.value == undefined){
              errores.push("Campo Obligatorio")
          }else if(changePass.value.length < 6){
            errores.push("Debe tener por lo menos 6 caracteres")
          }

          if(repassPass.value == "" ||
            repassPass.value == null ||
            repassPass.value == undefined){
              errores.push("Campo Obligatorio")
            }else if(repassPass.value.length < 6){
            errores.push("Debe tener por lo menos 6 caracteres")
          }

          if(repassPass != changePass){
            errores.push("Deben ser iguales")
          }

          if(errores.length > 0){
            erroresList.innerHTML = ""
            console.log("Error")
            for(i = 0; i < errores.length ; i++){
              erroresList.innerHTML += `<li class="error">${errores[i]}</li>`;
            }
            e.preventDefault();
          }
          });

        })