const SUPABASE_URL =
    "https://fzigbhjdocvqgzssxdlb.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aWdiaGpkb2N2cWd6c3N4ZGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDU5MjksImV4cCI6MjA5NjAyMTkyOX0.zvvShwKFoDrd44LGEYbxAs1cRzBF0BuZVaXM53-7WE8";

let db = null;

try{
    db =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
                auth:{
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );
}
catch(e){
    console.error("Supabase no cargó:", e);
}

let carrito = [];

/* ==========================
   ESPECIALIDADES
========================== */

function agregarEspecialidad(nombre){

    carrito.push({
        especialidad: true,
        nombre: nombre,
        tamano: '12 Oz'
    });

    actualizarCarrito();

    mostrarToast(`¡${nombre} agregado al carrito! 🍓`);
}

/* ==========================
   LIMITES
========================== */

function obtenerLimites(tamano){

    switch(tamano){

        case "Mini 9 Oz":
            return {
                dulces: 1,
                frutales: 0
            };

        case "Pequeño 12 Oz":
            return {
                dulces: 2,
                frutales: 1
            };

        case "Mediano 16 Oz":
            return {
                dulces: 4,
                frutales: 2
            };

        case "Grande 22 Oz":
            return {
                dulces: 6,
                frutales: 2
            };

        default:
            return {
                dulces: 1,
                frutales: 1
            };
    }
}
/* ==========================
   CONTADORES Y BLOQUEOS
========================== */

function actualizarContadores(){

    const tamano =
        document.querySelector('input[name="tamano"]:checked')?.value || "Mini 9 Oz";

    const limites =
        obtenerLimites(
            tamano
        );

    const dulcesSeleccionados =
        document.querySelectorAll(
            ".dulce:checked"
        ).length;

    const frutalesSeleccionados =
        document.querySelectorAll(
            ".frutal:checked"
        ).length;

    const totalSeleccionado =
        dulcesSeleccionados +
        frutalesSeleccionados;

    const totalMax = limites.dulces;

    document.getElementById(
        "contadorDulces"
    ).innerText =
        `Disponibles: ${
            totalMax - totalSeleccionado
        }`;

    document.getElementById(
        "contadorFrutales"
    ).innerText =
        `Disponibles: ${
            Math.min(
                limites.frutales - frutalesSeleccionados,
                totalMax - totalSeleccionado
            )
        }`;

    document
        .querySelectorAll(".dulce")
        .forEach(item=>{

            const bloqueado =
                !item.checked &&
                totalSeleccionado >= totalMax;

            item.disabled = bloqueado;

            item.closest(".topping-card")
                .classList
                .toggle("bloqueado", bloqueado);
        });

    document
        .querySelectorAll(".frutal")
        .forEach(item=>{

            const bloqueado =
                !item.checked &&
                (
                    frutalesSeleccionados >= limites.frutales ||
                    totalSeleccionado >= totalMax
                );

            item.disabled = bloqueado;

            item.closest(".topping-card")
                .classList
                .toggle("bloqueado", bloqueado);
        });
}

/* ==========================
   AGREGAR AL CARRITO
========================== */

function agregarCarrito(){

    const tamano =
        document.querySelector('input[name="tamano"]:checked')?.value || "Mini 9 Oz";

    const sabor =
        document.querySelector('input[name="sabor"]:checked')?.value || "Tradicional";

    const dulces =
        [...document.querySelectorAll(".dulce:checked")]
        .map(x => x.value);

    const frutales =
        [...document.querySelectorAll(".frutal:checked")]
        .map(x => x.value);

    carrito.push({

        especialidad:false,

        tamano:tamano,

        sabor:sabor,

        dulces:dulces,

        frutales:frutales

    });

    actualizarCarrito();

    document
        .querySelectorAll(
            ".dulce, .frutal"
        )
        .forEach(item=>{

            item.checked = false;
            item.disabled = false;

        });

    actualizarContadores();

    mostrarToast('¡Fresa personalizada agregada al carrito! 🍓');
}

/* ==========================
   ACTUALIZAR CARRITO
========================== */

function actualizarCarrito(){

    const contenedor =
        document.getElementById(
            "carrito"
        );

    contenedor.innerHTML = "";
    contenedor.className = "grid-carrito";

    document.getElementById(
        "tituloCarrito"
    ).innerText =
        `🛒 Mi Pedido (${carrito.length})`;

    const contFlotante = document.getElementById("contadorFlotante");
    if(contFlotante) contFlotante.innerText = carrito.length;

    if(carrito.length === 0){

        contenedor.innerHTML =
        `
        <div class="item-carrito">
            Tu carrito está vacío.
        </div>
        `;

        return;
    }

    carrito.forEach(
        (item,index)=>{

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "item-carrito";

        div.className = "item-carrito-card";

        const detalleEspecialidades = {
            'Oreo Especial':     { crema:'Oreo', toppings:'Oreo triturada, M&M' },
            'Tradicional':       { crema:'Tradicional', toppings:'Masmelos, M&M' },
            'Maracuyá Especial': { crema:'Maracuyá', toppings:'Masmelos, Quipitos' }
        };

        if(item.especialidad){
            const det = detalleEspecialidades[item.nombre] || {};
            div.innerHTML = `
                <div class="item-card-body">
                    <h4>⭐ ${item.nombre}</h4>
                    <p>🥤 ${item.tamano}</p>
                    <p>🍦 Crema ${det.crema || ''}</p>
                    <p>🍓 Fresas frescas</p>
                    <p>🍪 ${det.toppings || ''}</p>
                </div>
                <button class="eliminar-btn" onclick="eliminarProducto(${index})">✕ Quitar</button>
            `;
        } else {
            div.innerHTML = `
                <div class="item-card-body">
                    <h4>🍓 Personalizada</h4>
                    <p>🥤 ${item.tamano}</p>
                    <p>🍦 Crema ${item.sabor}</p>
                    <p>🍓 Fresas frescas</p>
                    ${item.dulces.length ? `<p>🍪 ${item.dulces.join(', ')}</p>` : ''}
                    ${item.frutales.length ? `<p>🍒 ${item.frutales.join(', ')}</p>` : ''}
                </div>
                <button class="eliminar-btn" onclick="eliminarProducto(${index})">✕ Quitar</button>
            `;
        }

        contenedor.appendChild(div);
    });
}

/* ==========================
   ELIMINAR PRODUCTO
========================== */

function eliminarProducto(index){

    carrito.splice(
        index,
        1
    );

    actualizarCarrito();
}
/* ==========================
   GUARDAR PEDIDO SUPABASE
========================== */

async function guardarPedido(datos){

    if(!db){
        console.error("Supabase no disponible");
        return null;
    }

    const { data, error } =
        await db
            .from("pedidos")
            .insert([datos])
            .select();

    if(error){

        console.error(
            "Error Supabase:",
            error
        );

        return null;
    }

    return data[0];
}

/* ==========================
   ENVIAR PEDIDO
========================== */

async function enviarPedido(){

    const nombre =
        document
            .getElementById(
                "nombre"
            )
            .value
            .trim();

    const telefono =
        document
            .getElementById(
                "telefono"
            )
            .value
            .trim();

    const direccion =
        document
            .getElementById(
                "direccion"
            )
            .value
            .trim();

    if(!nombre){

        alert(
            "Ingresa tu nombre"
        );

        return;
    }

    if(!telefono){

        alert(
            "Ingresa tu teléfono"
        );

        return;
    }

    if(!direccion){

        alert(
            "Ingresa tu dirección"
        );

        return;
    }

    if(carrito.length === 0){
        alert("Debes agregar al menos un producto");
        return;
    }

    const esRegalo = document.getElementById('esRegalo')?.checked || false;
    const nombreRegalo = document.getElementById('nombreRegalo')?.value.trim() || '';
    const mensajeRegalo = document.getElementById('mensajeRegalo')?.value.trim() || '';

    if(esRegalo && !nombreRegalo){
        alert("Ingresa el nombre de la persona que recibirá el regalo");
        return;
    }

    const pedido = {
        cliente: nombre,
        telefono: telefono,
        direccion: direccion,
        es_regalo: esRegalo,
        nombre_regalo: nombreRegalo,
        mensaje_regalo: mensajeRegalo,
        detalle_pedido: carrito
    };

    try{

        const resultado =
            await guardarPedido(
                pedido
            );

        if(!resultado){

            alert(
                "No fue posible guardar el pedido."
            );

            return;
        }

        const numeroPedido =
            resultado.numero_pedido;

        let detalle = "";

        carrito.forEach(
            (
                item,
                index
            )=>{

            if(item.especialidad){

                detalle +=
`
⭐ Especialidad ${index + 1}

${item.nombre}

Tamaño:
${item.tamano}

-----------------------
`;
            }
            else{

                detalle +=
`
🍓 Personalizada ${index + 1}

Tamaño:
${item.tamano}

Crema:
${item.sabor}

Dulces:
${item.dulces.join(", ") || "Ninguno"}

Frutales:
${item.frutales.join(", ") || "Ninguno"}

-----------------------
`;
            }
        });

        let regaloParte = '';
        if(esRegalo){
            regaloParte = `
🎁 ES UN REGALO
Para: ${nombreRegalo}
Mensaje: ${mensajeRegalo || 'Sin mensaje'}

=======================
`;
        }

        const mensaje =
`🍓 NUEVO PEDIDO - Placeres Cremosos

Pedido #${numeroPedido}

Cliente: ${nombre}
Teléfono: ${telefono}
Dirección: ${direccion}
${regaloParte}
=======================

${detalle}`;

        const numeroWhatsapp = "573041462408";
        const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;

        // Mostrar popup de éxito
        const popup = document.getElementById('popupExito');
        popup.classList.remove('oculto');

        // Redirigir a WhatsApp después de 2.5 segundos
        setTimeout(function(){
            popup.classList.add('oculto');
            window.open(urlWhatsapp);
        }, 2500);

        carrito = [];

        actualizarCarrito();

        document.getElementById(
            "nombre"
        ).value = "";

        document.getElementById(
            "telefono"
        ).value = "";

        document.getElementById(
            "direccion"
        ).value = "";

        document
            .querySelectorAll(
                ".dulce, .frutal"
            )
            .forEach(item=>{

                item.checked = false;
                item.disabled = false;

            });

        /* Limpiar campos de regalo */
        const esRegaloCheck = document.getElementById("esRegalo");
        if(esRegaloCheck){
            esRegaloCheck.checked = false;
        }
        const nombreRegaloInput = document.getElementById("nombreRegalo");
        if(nombreRegaloInput){
            nombreRegaloInput.value = "";
        }
        const mensajeRegaloInput = document.getElementById("mensajeRegalo");
        if(mensajeRegaloInput){
            mensajeRegaloInput.value = "";
        }
        const seccionRegalo = document.getElementById("seccionRegalo");
        if(seccionRegalo){
            seccionRegalo.style.display = "none";
        }

        actualizarContadores();

    }
    catch(ex){

        console.error(ex);

        alert(
            "Error conectando con Supabase"
        );
    }
}

/* ==========================
   EVENTOS
========================== */

/* Escuchar cambios en tamaño (radio buttons) */
document
    .querySelectorAll('input[name="tamano"]')
    .forEach(item=>{
        item.addEventListener("change", actualizarContadores);
    });

document
    .querySelectorAll(".dulce, .frutal")
    .forEach(item=>{
        item.addEventListener("change", actualizarContadores);
    });

/* Bloqueo preventivo: intercepta el click
   ANTES de que el checkbox cambie de estado */

document
    .querySelectorAll(".dulce")
    .forEach(item=>{

        item.addEventListener(
            "click",
            function(e){

                if(this.checked) return;

                const tamano =
                    document.querySelector(
                        'input[name="tamano"]:checked'
                    )?.value || "Mini 9 Oz";

                const limites = obtenerLimites(tamano);

                const total =
                    document.querySelectorAll(
                        ".dulce:checked, .frutal:checked"
                    ).length;

                if(total >= limites.dulces)
                    e.preventDefault();
            }
        );
    });

document
    .querySelectorAll(".frutal")
    .forEach(item=>{

        item.addEventListener(
            "click",
            function(e){

                if(this.checked) return;

                const tamano =
                    document.querySelector(
                        'input[name="tamano"]:checked'
                    )?.value || "Mini 9 Oz";

                const limites = obtenerLimites(tamano);

                const totalFrutales =
                    document.querySelectorAll(
                        ".frutal:checked"
                    ).length;

                const total =
                    document.querySelectorAll(
                        ".dulce:checked, .frutal:checked"
                    ).length;

                if(
                    totalFrutales >= limites.frutales ||
                    total >= limites.dulces
                )
                    e.preventDefault();
            }
        );
    });

/* ==========================
   INICIO
========================== */

actualizarCarrito();

actualizarContadores();


/* ==========================
   TOGGLE REGALO
========================== */

/* ==========================
   MOSTRAR SECCIONES
========================== */

var _seccionActual = 'recomendados';

function _ocultarTodo(){
    ['seccion-recomendados','seccion-btn-personalizar',
     'seccion-personaliza','seccion-pedido','seccion-datos'].forEach(function(id){
        var el = document.getElementById(id);
        if(!el) return;
        el.classList.add('seccion-oculta');
        el.classList.remove('seccion-visible');
        el.style.display = '';
    });
}

function _mostrar(ids){
    ids.forEach(function(id){
        var el = document.getElementById(id);
        if(!el) return;
        el.classList.remove('seccion-oculta');
        el.classList.add('seccion-visible');
    });
}

function cambiarTab(vista){
    var tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(function(t){ t.classList.remove('tab-activo'); });

    if(vista === 'recomendados'){
        _ocultarTodo();
        document.documentElement.classList.add('sin-scroll');
        document.getElementById('seccion-recomendados').style.display = '';
        document.getElementById('seccion-recomendados').classList.remove('seccion-oculta');
        tabs[0].classList.add('tab-activo');
        document.body.className = 'vista-recomendados';
        _seccionActual = 'recomendados';
    } else {
        _ocultarTodo();
        document.documentElement.classList.remove('sin-scroll');
        _mostrar(['seccion-personaliza']);
        tabs[1].classList.add('tab-activo');
        document.body.className = 'vista-personaliza';
        _seccionActual = 'personaliza';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarPersonalizar(){
    cambiarTab('personaliza');
}

function mostrarPedido(){
    if(carrito.length === 0){
        alert('Aún no has agregado productos al carrito 🛒');
        return;
    }
    _ocultarTodo();
    document.documentElement.classList.remove('sin-scroll');
    _mostrar(['seccion-pedido','seccion-datos']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    _seccionActual = 'pedido';
}

function volverPersonalizar(){
    _ocultarTodo();
    _mostrar(['seccion-personaliza']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    _seccionActual = 'personaliza';
}

function volverRecomendados(){
    _ocultarTodo();
    document.documentElement.classList.add('sin-scroll');
    document.getElementById('seccion-recomendados').style.display = '';
    document.getElementById('seccion-btn-personalizar').style.display = '';
    document.getElementById('seccion-recomendados').classList.remove('seccion-oculta');
    document.getElementById('seccion-btn-personalizar').classList.remove('seccion-oculta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    _seccionActual = 'recomendados';
    document.body.className = 'vista-recomendados';
}

/* ==========================
   TOAST NOTIFICACIÓN
========================== */

function mostrarToast(msg){
    var t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.classList.add('toast-visible');
    setTimeout(function(){ t.classList.remove('toast-visible'); }, 2500);
}

function toggleRegalo(){
    const esRegalo = document.getElementById('esRegalo').checked;
    const seccion = document.getElementById('seccionRegalo');
    if(esRegalo){
        seccion.classList.remove('oculto');
    } else {
        seccion.classList.add('oculto');
    }
}