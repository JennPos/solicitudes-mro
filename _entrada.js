function Entrada({onEntrar}){
  const [error,setError] = useState("");
  const [correo,setCorreo] = useState("");
  const [nombre,setNombre] = useState("");
  const dominio = window.MRO_DOMINIO || 'rubber-mexico.com';
  const conGoogle = !!window.MRO_GOOGLE_CLIENT_ID;
  const correoOk = new RegExp("^[^@\\s]+@" + dominio.replace(/\./g,"\\.") + "$","i").test(correo.trim());
  const puede = correoOk && nombre.trim();

  return h("div",{className:"wrap",style:{maxWidth:520, paddingTop:56}},
    h("div",{className:"panel",style:{padding:"36px 32px"}},
      h("div",{style:{fontSize:26,fontWeight:700,letterSpacing:"-.02em",color:"var(--ink)",textAlign:"center"}},
        "Solicitud de material"),
      h("div",{className:"muted",style:{marginTop:8,marginBottom:28,fontSize:14.5,textAlign:"center"}},
        "Pide lo que necesitas al almacén MRO. Entra con tu correo ",
        h("b",null,"@"+dominio),"."),

      conGoogle
        ? h(Fragment,null,
            h(BotonGoogle,{onCredential:c=>{
                const r = SESION.entrar(c);
                if(r.ok){ setError(""); onEntrar(); } else setError(r.error);
              }, onError:setError}))
        /* Sin el acceso de Google configurado, se entra escribiendo el correo.
           Queda marcado como no verificado para que el almacén lo sepa.      */
        : h(Fragment,null,
            h(Field,{label:"Tu correo de la empresa"},
              h("input",{className:"form-control",type:"email",value:correo,autoFocus:true,
                placeholder:"nombre@"+dominio,
                onChange:e=>{ setCorreo(e.target.value); setError(""); }})),
            h(Field,{label:"Tu nombre"},
              h("input",{className:"form-control",value:nombre,placeholder:"Nombre y apellido",
                onChange:e=>setNombre(e.target.value)})),
            correo.trim() && !correoOk
              ? h("div",{className:"hint warn"},"Tiene que ser un correo @"+dominio+".") : null,
            h("button",{className:"btn btn-primary",style:{width:"100%",height:42},disabled:!puede,
              onClick:()=>{
                const r = SESION.entrarConCorreo(correo.trim().toLowerCase(), nombre.trim());
                if(r.ok){ setError(""); onEntrar(); } else setError(r.error);
              }}, "Entrar")),

      error ? h("div",{className:"hint warn",style:{marginTop:22}},error) : null,
      h("div",{className:"muted",style:{marginTop:26,fontSize:12.5,textAlign:"center"}},
        conGoogle
          ? "Tu nombre y tu correo salen de Google; no se captura ninguna contraseña aquí."
          : "No se pide contraseña. Tu correo queda en la solicitud para que el almacén sepa a quién avisarle."));
}
