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
        nombre: nombre
    });

    actualizarCarrito();

    alert(
        `${nombre} agregado al carrito`
    );
}

/* ==========================
   LIMITES
========================== */

function obtenerLimites(tamano){

    switch(tamano){

        case "Pequeño":
            return {
                dulces: 3,
                frutales: 1
            };

        case "Mediano":
            return {
                dulces: 4,
                frutales: 2
            };

        case "Grande":
            return {
                dulces: 6,
                frutales: 2
            };

        default:
            return {
                dulces: 2,
                frutales: 1
            };
    }
}
/* ==========================
   CONTADORES Y BLOQUEOS
========================== */

function actualizarContadores(){

    const tamano =
        document.getElementById(
            "tamano"
        ).value;

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
        document.getElementById(
            "tamano"
        ).value;

    const sabor =
        document.getElementById(
            "sabor"
        ).value;

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

    alert(
        "Producto agregado al carrito"
    );
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

    document.getElementById(
        "tituloCarrito"
    ).innerText =
        `🛒 Mi Pedido (${carrito.length})`;

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

        if(item.especialidad){

            div.innerHTML = `
                <h4>
                    ⭐ ${item.nombre}
                </h4>

                <button
                    class="eliminar-btn"
                    onclick="eliminarProducto(${index})">

                    Eliminar

                </button>
            `;
        }
        else{

            div.innerHTML = `
                <h4>
                    🍓 Crema Personalizada
                </h4>

                <p>
                    <b>Tamaño:</b>
                    ${item.tamano}
                </p>

                <p>
                    <b>Crema:</b>
                    ${item.sabor}
                </p>

                <p>
                    <b>Dulces:</b>
                    ${item.dulces.join(", ") || "Ninguno"}
                </p>

                <p>
                    <b>Frutales:</b>
                    ${item.frutales.join(", ") || "Ninguno"}
                </p>

                <button
                    class="eliminar-btn"
                    onclick="eliminarProducto(${index})">

                    Eliminar

                </button>
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

        alert(
            "Debes agregar al menos un producto"
        );

        return;
    }

    const pedido = {

        cliente:
            nombre,

        telefono:
            telefono,

        direccion:
            direccion,

        detalle_pedido:
            carrito
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

        const mensaje =
`🍓 NUEVO PEDIDO

Pedido:
${numeroPedido}

Cliente:
${nombre}

Teléfono:
${telefono}

Dirección:
${direccion}

=======================

${detalle}`;

        const numeroWhatsapp =
            "573041462408";

        window.open(
            `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`
        );

        alert(
            `Pedido ${numeroPedido} creado correctamente`
        );

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

document
    .getElementById(
        "tamano"
    )
    .addEventListener(
        "change",
        actualizarContadores
    );

document
    .querySelectorAll(
        ".dulce, .frutal"
    )
    .forEach(item=>{

        item.addEventListener(
            "change",
            actualizarContadores
        );

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

                const limites =
                    obtenerLimites(
                        document.getElementById(
                            "tamano"
                        ).value
                    );

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

                const limites =
                    obtenerLimites(
                        document.getElementById(
                            "tamano"
                        ).value
                    );

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