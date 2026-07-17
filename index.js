const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs'); 
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers 
    ],
});

// --- CONFIGURACIÓN DE TUS IDs (TICKETS Y ROLES) ---
const CAT_TICKETS = '1396812080698495137'; 
const CAT_REGISTRO = '1526357310601953330'; 
const ID_CANAL_CREAR_VOZ = '1526355557684871238';
const ROLES_STAFF = [
    '1476181055928143943', // Helper
    '1384863304954024028', // Mod
    '1522926365232595014', // Staff
    '1384246636884000889'  // Owner
];

// --- CONFIGURACIÓN DE VERIFICACIÓN Y SANCIONES ---
const ID_CANAL_VERIFICACION = '1527278421162463252';
const ID_CANAL_REGISTRO_VERIFICACION = '1526365821151088660';
const ID_ROL_MIEMBRO = '1384240524172460082';
const ID_ROL_NO_VERIFICADO = '1527283602658689106'; 

const ID_CANAL_GENERAL = '1384242107862220880'; // Canal donde se avisan las sanciones
const ID_CANAL_REGISTRO_SANCIONES = '1527294013592436807'; // Canal privado de logs
const ID_CANAL_REDES = '1527772832660984028'; // Canal de anuncios de Bloody Blue

// Base de datos temporal para los canales de voz
const canalesTemporales = new Map();

// --- TEXTOS DEL SISTEMA DE INFORMACIÓN ---
const textosInfo = {
    inicio: {
        titulo: 'TMB STUDIO',
        desc: '# 🏰 Menú Inicial\nUtiliza los botones de abajo para navegar rápidamente por nuestras secciones.\n\n### 📒 Reglas\nConoce las normativas aplicadas en nuestro Discord, Eventos y Servidor.\n\n### ℹ️ Información\nDescubre cómo funcionan nuestros canales, categorías y modalidades.'
    },
    menuReglas: {
        titulo: 'SECCIÓN DE REGLAS',
        desc: '# ⚖️ Reglamentos\nElige qué tipo de normativa deseas consultar.\n\n### 🟣 Reglas DISCORD\nInfracciones que no debes cometer en el Discord.\n\n### 🟡 Reglas EVENTOS\nInfracciones que no debes cometer en los Eventos.\n\n### 🟢 Reglas SERVIDOR\nInfracciones que no debes cometer en el Servidor de Minecraft.'
    },
    menuInfo: {
        titulo: 'SECCIÓN DE INFORMACIÓN',
        desc: '# 📌 Información General\nElige qué tipo de detalles deseas consultar.\n\n### 📙 Información DISCORD\nGuía de uso de nuestros canales, roles e interacciones.\n\n### 📘 Información EVENTOS\nTipos de eventos, premios, rangos V.I.P y categorías.\n\n### 📗 Información SERVIDOR\nDetalles sobre el servidor, cómo entrar y de qué trata.'
    },
    reglasDiscord: `# 📖🟪 REGLAS DISCORD 🟪📖\n
### 1. 🔴 No hacer SPAM sin permiso (Abrir soporte)
> **1.1** Esto implica también en DM / PRIVADO a través de usuarios de este discord / Multimedia.
> **1.1.1** Puedes compartir CONTENIDO que sea RELACIONADO con Tmb Studio.

### 2. 🔴 No ACOSAR a cualquier tipo de usuario
> **2.1** Esto implica cualquier tipo de intento de LIGOTEO ABUSIVO / INSULTOS / ABRIR DM CON INTENCIONES QUE NO SON BUENAS / SER CÓMPLICE.
> **2.2** No puedes utilizar como EXCUSA cosas como: *"Era de broma"* o *"Estoy molestando solo"*.
> **2.3** Si la VÍCTIMA se siente acosada, tendrá la razón mientras el acusado incumpla con las reglas.

### 3. 🔴 No AMENAZAR a cualquier tipo de usuario
> **3.1** Implica intenciones o transmitir ODIO CON VENGANZA MUY AGRESIVA / DOXEO / AGRESIONES VERBALES PERSONALES.
> **3.2** No puedes utilizar como EXCUSA cosas como *"Era en un juego"* o *"Es un amigo"*.
> **3.3** Si la VÍCTIMA se siente amenazada, tendrá la razón absoluta.

### 4. 🔴 No hablar sobre TEMAS POLÍTICOS
> **4.1** Esta regla aplica también a temas políticos que sean del pasado.

### 5. 🔴 No DISCRIMINAR
> **5.1** Implica inferioridad o desigualdad por: raza, sexo, religión, orientation sexual, discapacidad u otras características especiales.

### 6. 🔴 No compartir CONTENIDO +18
> **6.1** Esto incluye NSFW (de cualquier tipo), GORE o CUALQUIER TIPO DE CONTENIDO DESAGRADABLE.

✅ **RECUERDA QUE QUEREMOS UNA COMUNIDAD SIN TOXICIDAD** ✅
⚠️ *SI VES QUE ALGUIEN INCUMPLE ESTAS NORMAS* ⚠️
🚨 **ABRE <#1493710862123274371> Y REPORTA A ESE USUARIO** 🚨`,

    reglasEventos: `# 📖🟨 REGLAS EVENTOS 🟨📖\n
### 1. 🔴 No hacer cualquier tipo de SPAM
> **1.1** Esto implica por CHAT / CHAT PRIVADO / CHAT DE PROXIMIDAD a cualquier usuario.

### 2. 🔴 No ACOSAR a cualquier tipo de usuario
> **2.1** Implica cualquier tipo de intento de LIGOTEO ABUSIVO / INSULTOS / SER CÓMPLICE.
> **2.2** No puedes utilizar como EXCUSA: *"Era de broma"* o *"Estoy molestando solo"*.
> **2.3** Esta regla aplica tanto en CHAT como en CHAT DE PROXIMIDAD.
> **2.4** Si la VÍCTIMA se siente acosada, tendrá la razón.

### 3. 🔴 No MOLESTAR en CHAT DE PROXIMIDAD
> **3.1** Esto implica directamente MIC-SPAM (saturar el micrófono).
> **3.1.1** Si varios usuarios o admins te piden que te bajes el volumen, hazlo.
> **3.1.2** Acusar de MIC-SPAM falsamente para silenciar a alguien será sancionado.
> **3.2** Prohibido CUALQUIER TIPO DE MÚSICA / SONIDOS / AUDIOS externos.

### 4. 🔴 No hablar sobre TEMAS POLÍTICOS
> **4.1** Incluye temas del pasado.

### 5. 🔴 No DISCRIMINAR
> **5.1** Implica cualquier trato de inferioridad por raza, sexo, religión, etc.

### 6. 🔴 Abandonos injustificados
> **6.1** Sí te sales del evento EN MITAD DE UNA PRUEBA serás eliminado. (Tendrás que avisar de INMEDIATO al creador o abrir TICKET).

✅ **RECUERDA QUE QUEREMOS UNA COMUNIDAD SIN TOXICIDAD** ✅
⚠️ *SI VES QUE ALGUIEN INCUMPLE ESTAS NORMAS* ⚠️
🚨 **ABRE <#1493710862123274371> Y REPORTA A ESE USUARIO** 🚨`,

    reglasServidor: `# 📖🟩 REGLAS SERVIDOR 🟩📖\n
### 1. 🔴 No hacer SPAM sin permiso (Abrir soporte)
> **1.1** Esto implica por CHAT / CHAT PRIVADO / CHAT DE PROXIMIDAD a cualquier usuario.

### 2. 🔴 No ACOSAR a cualquier usuario
> **2.1** Intento de LIGOTEO ABUSIVO fuera de rol / INSULTOS fuera de rol / SER CÓMPLICE.
> **2.2** No puedes utilizar como EXCUSA: *"Estaba roleando"* o *"Estoy molestando solo"*.
> **2.3** Si la VÍCTIMA se siente ACOSADA, tendrá la razón.
> **2.3.1** Si el ACUSADO se ve claramente que está haciendo rol, NO SE TOMARÁ COMO ACOSO.
> **2.3.2** Actitudes o comportamientos raros y frecuentes derivarán en INVESTIGACIÓN.

### 3. 🔴 No AMENAZAR a ningún usuario
> **3.1** Transmitir ODIO CON VENGANZA AGRESIVA / DOXEO / AGRESIONES VERBALES PERSONALES.
> **3.2** No sirve la EXCUSA: *"Estaba roleando"*.
> **3.3** Si el comportamiento supera el límite del rol, habrá investigación.

### 4. 🔴 No hablar sobre TEMAS POLÍTICOS
> **4.1** Totalmente prohibido.

### 5. 🔴 No DISCRIMINAR
> **5.1** No se tolera racismo, machismo, homofobia ni ningún tipo de discriminación.

### 6. 🔴 Respetar el ROLEO de los usuarios
> **6.1** Si se DETECTA un USUARIO rompiendo el ROL de otros, recibirá sanción.
> **6.1.1** Burlarse de alguien que está roleando de forma abusiva es sancionable.
> **6.1.2** Si alguien no sabe hacer ROLEPLAY, no se le sancionará mientras no arruine la experiencia de los demás.

✅ **RECUERDA QUE QUEREMOS UNA COMUNIDAD SIN TOXICIDAD** ✅
⚠️ *SI VES QUE ALGUIEN INCUMPLE ESTAS NORMAS* ⚠️
🚨 **ABRE <#1493710862123274371> Y REPORTA A ESE USUARIO** 🚨`,

    infoDiscord: `# 📙 INFORMACIÓN DISCORD\n
❗ **EN ESTE SERVIDOR PUEDES ACCEDER A TODOS NUESTROS CANALES PARA CONOCER A PERSONAS Y PASAR UN BUEN RATO** ❗

### 📌 TMB STUDIO
> <#1452327339990978704> 📢 **Anuncios:** ¡Entérate de todo antes que nadie! Actualizaciones oficiales.
> <#1468248035195617310> 📜 **Información:** La bible de la comunidad. Su lectura es obligatoria.
> <#1493710862123274371> 🎫 **Tickets:** Reporta bugs, errores, jugadores o solicita soporte.

### 🏆 TMB EVENTOS
> <#1440454128168861709> 🎯 **Eventos:** Fechas, premios y mecánicas del próximo evento.
> <#1452327540344492104> 🎙️ **Escenario:** Punto de encuentro antes del evento para aclarar dudas de última hora.
> <#1526534456578408458> 🔗 **Mods-IP:** Descarga los mods y obtén la IP de los eventos anunciados.

### 💬 COMUNIDAD
> <#1384242107862220880> 🌍 **General:** El centro neurálgico. Conoce gente e interactúa con la comunidad.
> <#1526874168635822080> 📸 **Multimedia:** Comparte vídeos, clips, imágenes y memes.
> <#1526355557684871238> 🔊 **Crear Voz:** Genera salas automáticas para charlar o jugar tranquilamente.

### 🌐 TMB SERVIDOR
> <#1523360647973306378> 🤖 **Chat Global:** Observa el CHAT del SERVIDOR en TIEMPO REAL sin entrar al juego.
> <#1526515556646125670> 📦 **Mods:** Prepara tu Minecraft descargando los archivos necesarios.`,

    infoEventos: `# 📘 INFORMACIÓN EVENTOS\n
❗ **TODA LA INFORMACIÓN PARA ENTENDER LA FUNCIÓN DE LOS EVENTOS, ROLES Y PREMIOS** ❗

### 👤 EVENTOS NORMALES
> Cada dos semanas se hace un evento. Los ganadores consiguen un **Ticket V.I.P.**

### 🎟️ TICKET V.I.P
> Te permite participar en el evento V.I.P de la edición en curso.
> - Se consiguen ganando EVENTOS NORMALES o comprándolos en la TIENDA.
> - Se pueden regalar o sortear abriendo un Ticket de soporte.
> - **Límite:** Solo puedes tener un ticket V.I.P a la vez.

### 💰 EVENTOS V.I.P
> Se realiza **uno por edición**. Los jugadores que poseen el rol <@&1384863457114984500> acceden a este evento donde hay en juego un **Premio en metálico**.

### 🔖 CATEGORÍAS DE PRUEBAS
> ⚔️ **HABILIDAD:** Requiere nivel mecánico y experiencia.
> 🍀 **SUERTE:** Requiere suerte pura.
> 🧠 **PSICOLOGÍA:** Requiere habilidad social, manipulación y sangre fría.
> ♟️ **ESTRATEGIA:** Requiere inteligencia, creación de juego e imaginación.

### 🖊️ EDICIONES
> Cada edición está compuesta por **5 eventos en total**: 4 eventos son normales, y la gran final es el evento V.I.P.`,

    infoServidor: `# 📗 INFORMACIÓN SERVIDOR\n
❗ **INFORMACIÓN BÁSICA PARA ENTENDER EL FORMATO DEL SERVIDOR** ❗

### 🤗 ¡Bienvenidos a Villazarzillo!

**¿En qué consiste?**
> Es un Servidor 24/7 con **economía, casino, música, bailes, roleplay y armas**. Buscamos crear una comunidad gigante para conocernos y disfrutar. 
> *Nota: Actualmente nos encontramos en la Beta 1.0, pero evolucionaremos con el avance de los jugadores.*

### 📌 PREGUNTAS FRECUENTES (F.A.Q)

**🎯 ¿Cuál es el objetivo principal del servidor?**
> Entretener, mantener y hacer crecer a esta increíble familia de jugadores.

**🕒 ¿Cuándo está abierto y cuánto durará esta Beta?**
> Está **abierto 24/7**. La beta finalizará y se actualizará en cuanto logremos una base de jugadores diarios estable.

**⚙️ ¿Qué necesito para poder entrar a jugar?**
> 1️⃣ Entra al canal <#1526515556646125670> y descarga los Mods.
> 2️⃣ En tu Minecraft, añade la IP que encontrarás en <#1523360647973306378>.
> 3️⃣ ¡Disfruta!`
};

client.once('ready', () => {
    console.log(`¡Bot encendido! Sistema operativo como ${client.user.tag}`);
});

// ==========================================
// 🚪 SISTEMA DE BIENVENIDA (AUTOROL NO VERIFICADO)
// ==========================================
client.on('guildMemberAdd', async (member) => {
    const rolNoVerificado = member.guild.roles.cache.get(ID_ROL_NO_VERIFICADO);
    if (rolNoVerificado) {
        await member.roles.add(rolNoVerificado).catch(console.error);
    }
});

// ==========================================
// 🎙️ SISTEMA DE CANALES DE VOZ (JOIN TO CREATE)
// ==========================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    
    // 1. Cuando entran al canal base de Crear Voz
    if (newState.channelId === ID_CANAL_CREAR_VOZ) {
        const guild = newState.guild;
        const member = newState.member;
        
        // Se crea su sala con los permisos específicos:
        const nuevoCanal = await guild.channels.create({
            name: `🔊 Sala de ${member.user.username}`,
            type: ChannelType.GuildVoice,
            parent: newState.channel.parentId,
            permissionOverwrites: [
                { id: guild.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] }, 
                { id: ID_ROL_NO_VERIFICADO, deny: [PermissionFlagsBits.ViewChannel] }, 
                { id: ID_ROL_MIEMBRO, deny: [PermissionFlagsBits.SendMessages] }, 
                { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages] } 
            ]
        });

        // Se mueve al usuario a su nueva sala
        await member.voice.setChannel(nuevoCanal);
        canalesTemporales.set(nuevoCanal.id, member.id);

        // Se envía el panel de control a la sala creada
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('⚙️ Panel de Control de Sala')
            .setDescription(`¡Hola <@${member.id}>! Eres el dueño de esta sala.\nUtiliza los botones de abajo para configurar todo.\n\n*Nota: Esta sala se eliminará sola cuando no quede nadie dentro.*`);

        const btnRenombrar = new ButtonBuilder().setCustomId('vc_renombrar').setLabel('Nombre / Capacidad').setStyle(ButtonStyle.Primary).setEmoji('📝');
        const btnCerrar = new ButtonBuilder().setCustomId('vc_privado').setLabel('Bloquear (Privado)').setStyle(ButtonStyle.Danger).setEmoji('🔒');
        const btnAbrir = new ButtonBuilder().setCustomId('vc_publico').setLabel('Abrir (Público)').setStyle(ButtonStyle.Success).setEmoji('🔓');

        const menuUsuarios = new UserSelectMenuBuilder()
            .setCustomId('vc_permitir_usuario')
            .setPlaceholder('Selecciona usuarios para dejarles entrar')
            .setMinValues(1)
            .setMaxValues(5);

        const menuBanear = new UserSelectMenuBuilder()
            .setCustomId('vc_denegar_usuario')
            .setPlaceholder('⛔ Selecciona usuarios para ECHAR / BLOQUEAR')
            .setMinValues(1)
            .setMaxValues(5);

        const fila1 = new ActionRowBuilder().addComponents(btnRenombrar, btnCerrar, btnAbrir);
        const fila2 = new ActionRowBuilder().addComponents(menuUsuarios);
        const fila3 = new ActionRowBuilder().addComponents(menuBanear);

        await nuevoCanal.send({ content: `<@${member.id}>`, embeds: [embed], components: [fila1, fila2, fila3] });
    }

    // 2. DAR PERMISO DE ESCRIBIR cuando alguien entra a una sala temporal (y no es el canal base)
    if (newState.channelId && canalesTemporales.has(newState.channelId) && newState.channelId !== oldState.channelId) {
        const canal = newState.channel;
        if (canal) {
            await canal.permissionOverwrites.edit(newState.id, { SendMessages: true }).catch(() => {});
        }
    }

    // 3. QUITAR PERMISO DE ESCRIBIR / BORRAR SALA cuando alguien sale de una sala temporal
    if (oldState.channelId && canalesTemporales.has(oldState.channelId) && oldState.channelId !== newState.channelId) {
        const canal = oldState.channel;
        if (canal) {
            // Si ya no queda nadie, se borra el canal temporal
            if (canal.members.size === 0) {
                canalesTemporales.delete(canal.id);
                await canal.delete().catch(() => {}); 
            } else {
                // Si la sala sigue abierta pero este usuario se fue, le quitamos el permiso de escribir
                await canal.permissionOverwrites.edit(oldState.id, { SendMessages: null }).catch(() => {});
            }
        }
    }
});


// --- COMANDOS DE TEXTO GLOBALES (!panel y !sancionar) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- COMANDOS PARA CREAR LOS PANELES ---
    if (message.content === '!panel_tickets') { 
        const embed = new EmbedBuilder()
            .setColor('#9b59b6') 
            .setDescription('# 🎫 Soporte Oficial\nBienvenido al sistema de asistencia de **Tmb Studio**.\n\nPor favor, selecciona en el menú de abajo el tipo de ayuda que necesitas para que podamos atenderte lo más rápido posible.')
            .setImage('https://cdn.discordapp.com/attachments/1527093135547695284/1527093195920642158/wmremove-transformed.png?ex=6a5a109d&is=6a58bf1d&hm=fb698b682918cafa83ba0c3fd5e54cfdd7556884c260b2073869a64099be6f13&'); 

        const menu = new StringSelectMenuBuilder()
            .setCustomId('menu_tickets')
            .setPlaceholder('Selecciona el tipo de ticket')
            .addOptions(
                { label: 'Soporte', description: 'Solicitar ayuda general', value: 'op_soporte', emoji: '🔧' },
                { label: 'Reportar a usuario', description: 'Denunciar el comportamiento de un jugador', value: 'op_reporte', emoji: '⚠️' },
                { label: 'Bugs o Errores', description: 'Reportar un fallo en alguna modalidad', value: 'op_bug', emoji: '🐛' }
            );

        const fila = new ActionRowBuilder().addComponents(menu);
        await message.channel.send({ embeds: [embed], components: [fila] });
        await message.delete();
    }

    if (message.content === '!panel_info') {
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setDescription(textosInfo.inicio.desc);

        const btnReglas = new ButtonBuilder().setCustomId('nav_privado_reglas').setLabel('Reglas').setStyle(ButtonStyle.Primary).setEmoji('📒');
        const btnInfo = new ButtonBuilder().setCustomId('nav_privado_info').setLabel('Información').setStyle(ButtonStyle.Secondary).setEmoji('ℹ️');
        
        const fila = new ActionRowBuilder().addComponents(btnReglas, btnInfo);
        await message.channel.send({ embeds: [embed], components: [fila] });
        await message.delete();
    }

    if (message.content === '!panel_verificacion') {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('✅ Verificación Tmb Studio')
            .setDescription('Para acceder al servidor, por favor haz clic en el botón de abajo y completa el breve formulario.');

        const btnVerificar = new ButtonBuilder().setCustomId('btn_abrir_verificacion').setLabel('Verificarse').setStyle(ButtonStyle.Success).setEmoji('✅');
        
        const fila = new ActionRowBuilder().addComponents(btnVerificar);
        await message.channel.send({ embeds: [embed], components: [fila] });
        await message.delete();
    }

    // ==========================================
    // ⚠️ NUEVO SISTEMA DE SANCIONES
    // Uso: !sancionar @usuario MOTIVO
    // ==========================================
    if (message.content.startsWith('!sancionar')) {
        const isStaff = ROLES_STAFF.some(roleId => message.member.roles.cache.has(roleId));
        if (!isStaff) return message.reply({ content: '❌ **Acceso Denegado:** No tienes permisos para usar este comando.' });

        const args = message.content.split(' ');
        const target = message.mentions.members.first();
        
        if (!target) return message.reply({ content: '❌ Debes mencionar a un usuario.\n**Uso correcto:** `!sancionar @usuario MOTIVO`' });

        // Extraer el motivo del mensaje
        const motivoIngresado = args.slice(2).join(' ').toUpperCase();
        
        let base = 0;
        let tipoSancion = '';
        let motivoOficial = '';

        // Detectar el motivo
        if (motivoIngresado.includes('SPAM')) { base = 4; tipoSancion = 'mute'; motivoOficial = 'SPAM'; }
        else if (motivoIngresado.includes('ACOSO')) { base = 8; tipoSancion = 'ban'; motivoOficial = 'ACOSO'; }
        else if (motivoIngresado.includes('AMENAZA')) { base = 12; tipoSancion = 'ban'; motivoOficial = 'AMENAZA'; }
        else if (motivoIngresado.includes('POLITIC') || motivoIngresado.includes('POLÍTIC')) { base = 2; tipoSancion = 'mute'; motivoOficial = 'TEMAS POLÍTICOS'; }
        else if (motivoIngresado.includes('DISCRIMINACION') || motivoIngresado.includes('DISCRIMINACIÓN')) { base = 12; tipoSancion = 'mute'; motivoOficial = 'DISCRIMINACIÓN'; }
        else if (motivoIngresado.includes('+18') || motivoIngresado.includes('CONTENIDO')) { base = 6; tipoSancion = 'mute'; motivoOficial = 'CONTENIDO +18'; }
        else {
            return message.reply({ content: '❌ **Motivo no válido.**\nMotivos aceptados: `SPAM`, `ACOSO`, `AMENAZA`, `TEMAS POLITICOS`, `DISCRIMINACION`, `CONTENIDO +18`' });
        }

        // LÓGICA DE BASE DE DATOS LOCAL
        const rutaSanciones = './sanciones.json';
        let sancionesDB = {};
        if (fs.existsSync(rutaSanciones)) {
            sancionesDB = JSON.parse(fs.readFileSync(rutaSanciones, 'utf8'));
        }

        if (!sancionesDB[target.id]) {
            sancionesDB[target.id] = { count: 0, last: 0 };
        }

        const ahora = Date.now();
        const treintaDiasMs = 30 * 24 * 60 * 60 * 1000;

        // Reiniciar contador si han pasado más de 30 días desde la última sanción
        if (ahora - sancionesDB[target.id].last > treintaDiasMs) {
            sancionesDB[target.id].count = 0;
        }

        const reincidencias = sancionesDB[target.id].count;
        let duracionMs = 0;
        let textoTiempo = '';

        // Escalado matemático
        if (reincidencias === 0) {
            duracionMs = base * 60 * 60 * 1000; // Horas
            textoTiempo = `${base} hora(s)`;
        } else if (reincidencias === 1) {
            duracionMs = base * 24 * 60 * 60 * 1000; // Días
            textoTiempo = `${base} día(s)`;
        } else if (reincidencias === 2) {
            duracionMs = base * 7 * 24 * 60 * 60 * 1000; // Semanas
            textoTiempo = `${base} semana(s)`;
        } else {
            duracionMs = base * 30 * 24 * 60 * 60 * 1000; // Meses
            textoTiempo = `${base} mes(es)`;
        }

        // Aplicar la sanción en Discord
        try {
            if (tipoSancion === 'mute') {
                const limiteDiscordMs = 28 * 24 * 60 * 60 * 1000; // 28 días es el tope de Discord
                if (duracionMs > limiteDiscordMs) {
                    duracionMs = limiteDiscordMs;
                    textoTiempo += ' *(Limitado a 28 días por límite técnico de Discord)*';
                }
                await target.timeout(duracionMs, motivoOficial);
            } else if (tipoSancion === 'ban') {
                await target.ban({ reason: motivoOficial });
            }
        } catch (error) {
            console.error(error);
            return message.reply({ content: '❌ **Error crítico:** No pude sancionar a este usuario. Comprueba que mi rol de Bot esté por encima de su rol en los ajustes del servidor.' });
        }

        // Guardar progreso en la base de datos
        sancionesDB[target.id].count += 1;
        sancionesDB[target.id].last = ahora;
        fs.writeFileSync(rutaSanciones, JSON.stringify(sancionesDB, null, 4));

        // 1. Mensaje público en el canal general
        const canalGeneral = message.guild.channels.cache.get(ID_CANAL_GENERAL);
        if (canalGeneral) {
            const embedPublico = new EmbedBuilder()
                .setColor(tipoSancion === 'ban' ? '#e74c3c' : '#f1c40f')
                .setDescription(`⚠️ El usuario **${target.user.username}** ha sido **${tipoSancion === 'ban' ? 'BANEADO' : 'MUTEADO'}** por el Administrador **${message.author.username}**.\n\n**Motivo:** ${motivoOficial}\n**Duración:** ${textoTiempo}\n\n*Reincidencias en los últimos 30 días: ${reincidencias}*`);
            await canalGeneral.send({ embeds: [embedPublico] });
        }

        // 2. Mensaje privado en el registro
        const canalRegistroSanciones = message.guild.channels.cache.get(ID_CANAL_REGISTRO_SANCIONES);
        if (canalRegistroSanciones) {
            const embedLog = new EmbedBuilder()
                .setColor('#2c3e50')
                .setTitle('🔨 Registro de Sanción')
                .addFields(
                    { name: 'Admin', value: `<@${message.author.id}>`, inline: true },
                    { name: 'Usuario Sancionado', value: `<@${target.id}> (${target.user.tag})`, inline: true },
                    { name: 'Acción', value: tipoSancion.toUpperCase(), inline: true },
                    { name: 'Motivo', value: motivoOficial, inline: true },
                    { name: 'Duración Asignada', value: textoTiempo, inline: true },
                    { name: 'Nivel de Reincidencia', value: `${reincidencias}`, inline: true }
                )
                .setTimestamp();
            await canalRegistroSanciones.send({ embeds: [embedLog] });
        }

        await message.reply({ content: `✅ Sanción aplicada correctamente a ${target.user.username}.` });
    }

    // ==========================================
    // 📢 SISTEMA DE ANUNCIOS DE REDES SOCIALES
    // USO DIRECTO: !comando <enlace>
    // ==========================================
    const comandosRedes = ['!youtube', '!twitch', '!tiktok', '!x', '!instagram'];
    const comandoUsado = message.content.split(' ')[0].toLowerCase();

    if (comandosRedes.includes(comandoUsado)) {
        if (message.channel.id !== ID_CANAL_REDES) return; 

        const args = message.content.split(' ');
        
        // Exigimos solo el comando y el enlace (mínimo 2 elementos)
        if (args.length < 2) {
             return message.reply(`❌ **Uso correcto:** \`${comandoUsado} <enlace>\``);
        }

        const enlace = args[1];
        const usuarioMencionado = message.author; // El @ es 100% de quien hace el comando

        let accionTexto = '';
        let colorPanel = '';
        let iconoPlataforma = '';

        if (comandoUsado === '!youtube') {
            // Detecta si es un Shorts o un vídeo normal para clavar el título
            if (enlace.includes('/shorts/')) {
                accionTexto = 'HA SUBIDO UN YOUTUBE SHORT';
            } else {
                accionTexto = 'HA SUBIDO UN NUEVO VÍDEO';
            }
            colorPanel = '#FF0000'; 
            iconoPlataforma = '▶️';
        } else if (comandoUsado === '!twitch') {
            accionTexto = 'ESTÁ EN DIRECTO';
            colorPanel = '#9146FF'; 
            iconoPlataforma = '📺';
        } else if (comandoUsado === '!tiktok') {
            accionTexto = 'HA PUBLICADO UN TIKTOK';
            colorPanel = '#000000'; 
            iconoPlataforma = '📱';
        } else if (comandoUsado === '!x') {
            accionTexto = 'HA PUBLICADO EN X';
            colorPanel = '#1DA1F2'; 
            iconoPlataforma = '💬';
        } else if (comandoUsado === '!instagram') {
            accionTexto = 'HA SUBIDO UNA PUBLICACIÓN';
            colorPanel = '#E1306C'; 
            iconoPlataforma = '📸';
        }

        const canalRedes = message.guild.channels.cache.get(ID_CANAL_REDES);
        if (!canalRedes) return message.reply('❌ Error interno: No encuentro el canal de redes configurado.');

        // Panel estético súper limpio de cabecera con el autor real
        const embedRedes = new EmbedBuilder()
            .setColor(colorPanel)
            .setDescription(`## ${iconoPlataforma} ${usuarioMencionado} ${accionTexto}`)
            .setFooter({ text: 'Tmb Studio - Notificación de Redes', iconURL: message.guild.iconURL() })
            .setTimestamp();

        try {
            // 1. Enviamos el panel decorativo del bot de cabecera
            await canalRedes.send({ embeds: [embedRedes] });
            
            // 2. Enviamos el enlace completamente limpio e independiente. 
            // Esto obliga a Discord a activar su scraper nativo y forzar la inserción (preview) gigante de cualquier plataforma.
            await canalRedes.send({ content: `${enlace}` });
            
            // Borramos el comando inicial para no ensuciar
            await message.delete();
        } catch (error) {
            console.log(`[DEBUG] ERROR AL ENVIAR O BORRAR:`, error);
        }
    }
});

// --- SISTEMA DE INTERACCIONES GLOBALES (Modales, Botones y Menús) ---
client.on('interactionCreate', async (interaction) => {

    // ==========================================
    // SISTEMA DE VERIFICACIÓN
    // ==========================================
    if (interaction.isButton() && interaction.customId === 'btn_abrir_verificacion') {
        const modal = new ModalBuilder().setCustomId('modal_verificacion').setTitle('Verificación de Acceso');

        const p1 = new TextInputBuilder().setCustomId('ver_descubierto').setLabel('¿Cómo has descubierto el servidor?').setStyle(TextInputStyle.Short).setRequired(true);
        const p2 = new TextInputBuilder().setCustomId('ver_actividad').setLabel('¿Cuánta va a ser tu actividad en este server?').setStyle(TextInputStyle.Short).setRequired(true);
        const p3 = new TextInputBuilder().setCustomId('ver_motivo').setLabel('¿Por qué motivo te quieres unir?').setStyle(TextInputStyle.Paragraph).setRequired(true);
        const p4 = new TextInputBuilder().setCustomId('ver_modalidad').setLabel('¿Por qué modalidad estás aquí? (Dis/Ev/Sv)').setStyle(TextInputStyle.Short).setRequired(true);
        const p5 = new TextInputBuilder().setCustomId('ver_normas').setLabel('Acepta las reglas escribiendo "Sí"').setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(p1),
            new ActionRowBuilder().addComponents(p2),
            new ActionRowBuilder().addComponents(p3),
            new ActionRowBuilder().addComponents(p4),
            new ActionRowBuilder().addComponents(p5)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_verificacion') {
        const descubierto = interaction.fields.getTextInputValue('ver_descubierto');
        const actividad = interaction.fields.getTextInputValue('ver_actividad');
        const motivo = interaction.fields.getTextInputValue('ver_motivo');
        const modalidad = interaction.fields.getTextInputValue('ver_modalidad');
        const normas = interaction.fields.getTextInputValue('ver_normas');

        // Enviar registro al canal de admins
        const canalRegistro = interaction.guild.channels.cache.get(ID_CANAL_REGISTRO_VERIFICACION);
        if (canalRegistro) {
            const embedRegistro = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('📝 Nuevo Formulario de Verificación')
                .addFields(
                    { name: '👤 Usuario', value: `<@${interaction.user.id}> (${interaction.user.tag})` },
                    { name: '🔍 Descubrimiento', value: descubierto },
                    { name: '⏱️ Actividad', value: actividad },
                    { name: '🎯 Motivo', value: motivo },
                    { name: '🎮 Modalidad', value: modalidad },
                    { name: '📜 Normas leídas', value: normas }
                )
                .setTimestamp();
            await canalRegistro.send({ embeds: [embedRegistro] });
        }

        // Dar el rol de Miembro y Quitar el de No Verificado
        const rolMiembro = interaction.guild.roles.cache.get(ID_ROL_MIEMBRO);
        const rolNoVerificado = interaction.guild.roles.cache.get(ID_ROL_NO_VERIFICADO);
        
        if (rolMiembro) {
            await interaction.member.roles.add(rolMiembro).catch(console.error);
        }
        if (rolNoVerificado) {
            await interaction.member.roles.remove(rolNoVerificado).catch(console.error);
        }

        await interaction.reply({ content: '✅ Formulario enviado correctamente. ¡Bienvenido a Tmb Studio! Recuerda leer las normas en <#1468248035195617310>', ephemeral: true });
    }
    
    // ==========================================
    // INTERACCIONES DEL SISTEMA DE VOCES
    // ==========================================
    if (interaction.isButton() && interaction.customId.startsWith('vc_')) {
        const canalVoz = interaction.member.voice.channel;
        
        if (!canalVoz || canalesTemporales.get(canalVoz.id) !== interaction.user.id) {
            return interaction.reply({ content: '❌ **No tienes permiso.** Solo el creador de la sala puede usar estos botones, o no estás conectado a ella.', ephemeral: true });
        }

        if (interaction.customId === 'vc_renombrar') {
            const modal = new ModalBuilder().setCustomId('modal_vc_ajustes').setTitle('Ajustes de Sala');
            const inputNombre = new TextInputBuilder().setCustomId('vc_nuevo_nombre').setLabel('Nombre del canal de voz').setStyle(TextInputStyle.Short).setRequired(true);
            const inputLimite = new TextInputBuilder().setCustomId('vc_nuevo_limite').setLabel('Capacidad de usuarios (0 = Infinito)').setStyle(TextInputStyle.Short).setRequired(true).setValue('0');
            
            modal.addComponents(new ActionRowBuilder().addComponents(inputNombre), new ActionRowBuilder().addComponents(inputLimite));
            await interaction.showModal(modal);
        }
        
        if (interaction.customId === 'vc_privado') {
            await canalVoz.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
            await interaction.reply({ content: '🔒 **Sala bloqueada.** Ahora nadie puede entrar sin que le des permiso.', ephemeral: true });
        }
        
        if (interaction.customId === 'vc_publico') {
            await canalVoz.permissionOverwrites.edit(interaction.guild.id, { Connect: null });
            await interaction.reply({ content: '🔓 **Sala pública.** Todo el mundo puede unirse de nuevo.', ephemeral: true });
        }
    }

    if (interaction.isUserSelectMenu() && interaction.customId === 'vc_permitir_usuario') {
        const canalVoz = interaction.member.voice.channel;
        
        if (!canalVoz || canalesTemporales.get(canalVoz.id) !== interaction.user.id) {
            return interaction.reply({ content: '❌ Solo el creador de la sala puede añadir gente.', ephemeral: true });
        }

        const usuarios = interaction.users;
        for (const [id, user] of usuarios) {
            await canalVoz.permissionOverwrites.edit(id, { Connect: true, ViewChannel: true });
        }
        
        await interaction.reply({ content: `✅ Permiso concedido a los usuarios seleccionados. ¡Ya pueden entrar!`, ephemeral: true });
    }

    if (interaction.isUserSelectMenu() && interaction.customId === 'vc_denegar_usuario') {
        const canalVoz = interaction.member.voice.channel;
        if (!canalVoz || canalesTemporales.get(canalVoz.id) !== interaction.user.id) {
            return interaction.reply({ content: '❌ Solo el creador de la sala puede banear gente.', ephemeral: true });
        }

        const usuarios = interaction.users;
        for (const [id, user] of usuarios) {
            await canalVoz.permissionOverwrites.edit(id, { Connect: false });
            
            const miembroAExpulsar = canalVoz.members.get(id);
            if (miembroAExpulsar) {
                await miembroAExpulsar.voice.disconnect('Expulsado por el dueño de la sala');
            }
        }
        await interaction.reply({ content: `⛔ Usuarios bloqueados. Ya no pueden entrar y han sido expulsados de la llamada.`, ephemeral: true });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_vc_ajustes') {
        const canalVoz = interaction.member.voice.channel;
        if (!canalVoz || canalesTemporales.get(canalVoz.id) !== interaction.user.id) return;

        const nombre = interaction.fields.getTextInputValue('vc_nuevo_nombre');
        const limiteStr = interaction.fields.getTextInputValue('vc_nuevo_limite');
        const limite = parseInt(limiteStr);

        if (isNaN(limite) || limite < 0 || limite > 99) {
            return interaction.reply({ content: '❌ El límite debe ser un número entre 0 y 99.', ephemeral: true });
        }

        await canalVoz.setName(nombre);
        await canalVoz.setUserLimit(limite);
        
        await interaction.reply({ content: `✅ Sala actualizada:\n**Nombre:** ${nombre}\n**Capacidad:** ${limite === 0 ? 'Ilimitada' : limite}`, ephemeral: true });
    }

    // ==========================================
    // SISTEMA DE NAVEGACIÓN PRIVADA
    // ==========================================
    if (interaction.isButton() && interaction.customId.startsWith('nav_')) {
        const id = interaction.customId;
        let nuevoEmbed = new EmbedBuilder().setColor('#2b2d31');
        let nuevaFila = new ActionRowBuilder();

        if (id === 'nav_privado_reglas' || id === 'nav_privado_info') {
            if (id === 'nav_privado_reglas') {
                nuevoEmbed.setDescription(textosInfo.menuReglas.desc).setColor('Yellow');
                nuevaFila.addComponents(
                    new ButtonBuilder().setCustomId('nav_reglas_discord').setLabel('Discord').setStyle(ButtonStyle.Secondary).setEmoji('🟣'),
                    new ButtonBuilder().setCustomId('nav_reglas_eventos').setLabel('Eventos').setStyle(ButtonStyle.Secondary).setEmoji('🟡'),
                    new ButtonBuilder().setCustomId('nav_reglas_servidor').setLabel('Servidor').setStyle(ButtonStyle.Secondary).setEmoji('🟢'),
                    new ButtonBuilder().setCustomId('nav_cerrar').setLabel('Cerrar Menú').setStyle(ButtonStyle.Danger).setEmoji('✖️')
                );
            } else {
                nuevoEmbed.setDescription(textosInfo.menuInfo.desc).setColor('Blue');
                nuevaFila.addComponents(
                    new ButtonBuilder().setCustomId('nav_info_discord').setLabel('Discord').setStyle(ButtonStyle.Secondary).setEmoji('📙'),
                    new ButtonBuilder().setCustomId('nav_info_eventos').setLabel('Eventos').setStyle(ButtonStyle.Secondary).setEmoji('📘'),
                    new ButtonBuilder().setCustomId('nav_info_servidor').setLabel('Servidor').setStyle(ButtonStyle.Secondary).setEmoji('📗'),
                    new ButtonBuilder().setCustomId('nav_cerrar').setLabel('Cerrar Menú').setStyle(ButtonStyle.Danger).setEmoji('✖️')
                );
            }
            return await interaction.reply({ embeds: [nuevoEmbed], components: [nuevaFila], ephemeral: true });
        }

        if (id === 'nav_cerrar') {
            return await interaction.update({ content: '✅ **Menú cerrado correctamente.** (Puedes pulsar en "Descartar mensaje" para ocultarlo por completo)', embeds: [], components: [] });
        }

        if (id === 'nav_menu_reglas') {
            nuevoEmbed.setDescription(textosInfo.menuReglas.desc).setColor('Yellow');
            nuevaFila.addComponents(
                new ButtonBuilder().setCustomId('nav_reglas_discord').setLabel('Discord').setStyle(ButtonStyle.Secondary).setEmoji('🟣'),
                new ButtonBuilder().setCustomId('nav_reglas_eventos').setLabel('Eventos').setStyle(ButtonStyle.Secondary).setEmoji('🟡'),
                new ButtonBuilder().setCustomId('nav_reglas_servidor').setLabel('Servidor').setStyle(ButtonStyle.Secondary).setEmoji('🟢'),
                new ButtonBuilder().setCustomId('nav_cerrar').setLabel('Cerrar Menú').setStyle(ButtonStyle.Danger).setEmoji('✖️')
            );
        }
        else if (id === 'nav_menu_info') {
            nuevoEmbed.setDescription(textosInfo.menuInfo.desc).setColor('Blue');
            nuevaFila.addComponents(
                new ButtonBuilder().setCustomId('nav_info_discord').setLabel('Discord').setStyle(ButtonStyle.Secondary).setEmoji('📙'),
                new ButtonBuilder().setCustomId('nav_info_eventos').setLabel('Eventos').setStyle(ButtonStyle.Secondary).setEmoji('📘'),
                new ButtonBuilder().setCustomId('nav_info_servidor').setLabel('Servidor').setStyle(ButtonStyle.Secondary).setEmoji('📗'),
                new ButtonBuilder().setCustomId('nav_cerrar').setLabel('Cerrar Menú').setStyle(ButtonStyle.Danger).setEmoji('✖️')
            );
        }
        else if (id === 'nav_reglas_discord') {
            nuevoEmbed.setDescription(textosInfo.reglasDiscord).setColor('Purple');
            nuevaFila.addComponents(new ButtonBuilder().setCustomId('nav_menu_reglas').setLabel('Volver a Reglas').setStyle(ButtonStyle.Danger).setEmoji('🔙'));
        }
        else if (id === 'nav_reglas_eventos') {
            nuevoEmbed.setDescription(textosInfo.reglasEventos).setColor('Yellow');
            nuevaFila.addComponents(new ButtonBuilder().setCustomId('nav_menu_reglas').setLabel('Volver a Reglas').setStyle(ButtonStyle.Danger).setEmoji('🔙'));
        }
        else if (id === 'nav_reglas_servidor') {
            nuevoEmbed.setDescription(textosInfo.reglasServidor).setColor('Green');
            nuevaFila.addComponents(new ButtonBuilder().setCustomId('nav_menu_reglas').setLabel('Volver a Reglas').setStyle(ButtonStyle.Danger).setEmoji('🔙'));
        }
        else if (id === 'nav_info_discord') {
            nuevoEmbed.setDescription(textosInfo.infoDiscord).setColor('Orange');
            nuevaFila.addComponents(new ButtonBuilder().setCustomId('nav_menu_info').setLabel('Volver a Información').setStyle(ButtonStyle.Danger).setEmoji('🔙'));
        }
        else if (id === 'nav_info_eventos') {
            nuevoEmbed.setDescription(textosInfo.infoEventos).setColor('Blue');
            nuevaFila.addComponents(new ButtonBuilder().setCustomId('nav_menu_info').setLabel('Volver a Información').setStyle(ButtonStyle.Danger).setEmoji('🔙'));
        }
        else if (id === 'nav_info_servidor') {
            nuevoEmbed.setDescription(textosInfo.infoServidor).setColor('Green');
            nuevaFila.addComponents(new ButtonBuilder().setCustomId('nav_menu_info').setLabel('Volver a Información').setStyle(ButtonStyle.Danger).setEmoji('🔙'));
        }

        await interaction.update({ embeds: [nuevoEmbed], components: [nuevaFila] });
    }

    // ==========================================
    // SISTEMA DE TICKETS
    // ==========================================
    if (interaction.isStringSelectMenu() && interaction.customId === 'menu_tickets') {
        const opcion = interaction.values[0];

        if (opcion === 'op_soporte') {
            await crearCanalTicket(interaction, 'Soporte', 'Ticket de soporte general.');
        } 
        else if (opcion === 'op_reporte') {
            const modal = new ModalBuilder().setCustomId('modal_reporte').setTitle('Reportar a un usuario');
            const inputUser = new TextInputBuilder().setCustomId('rep_user').setLabel('¿A qué usuario deseas reportar?').setStyle(TextInputStyle.Short).setRequired(true);
            const inputDesc = new TextInputBuilder().setCustomId('rep_desc').setLabel('¿Qué ha ocurrido?').setStyle(TextInputStyle.Paragraph).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(inputUser), new ActionRowBuilder().addComponents(inputDesc));
            await interaction.showModal(modal);
        }
        else if (opcion === 'op_bug') {
            const modal = new ModalBuilder().setCustomId('modal_bug').setTitle('Reportar un Bug');
            const inputMod = new TextInputBuilder().setCustomId('bug_mod').setLabel('¿En qué modalidad? (eventos/server/discord)').setPlaceholder('Ej: Eventos / Servidor / Discord...').setStyle(TextInputStyle.Short).setRequired(true);
            const inputDesc = new TextInputBuilder().setCustomId('bug_desc').setLabel('¿Qué ha ocurrido exactamente?').setStyle(TextInputStyle.Paragraph).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(inputMod), new ActionRowBuilder().addComponents(inputDesc));
            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_reporte') {
            const userReportado = interaction.fields.getTextInputValue('rep_user');
            const descripcion = interaction.fields.getTextInputValue('rep_desc');
            const infoExtra = `**Usuario a reportar:** ${userReportado}\n**Descripción:** ${descripcion}`;
            await crearCanalTicket(interaction, 'Reporte', infoExtra);
        }
        else if (interaction.customId === 'modal_bug') {
            const modalidad = interaction.fields.getTextInputValue('bug_mod');
            const descripcion = interaction.fields.getTextInputValue('bug_desc');
            const infoExtra = `**Modalidad:** ${modalidad}\n**Descripción del error:** ${descripcion}`;
            await crearCanalTicket(interaction, 'Bug', infoExtra);
        }
    }

    if (interaction.isButton() && !interaction.customId.startsWith('nav_') && !interaction.customId.startsWith('vc_') && interaction.customId !== 'btn_abrir_verificacion') {
        if (interaction.customId === 'cerrar_ticket') {
            const esStaff = ROLES_STAFF.some(roleId => interaction.member.roles.cache.has(roleId));
            if (!esStaff) return interaction.reply({ content: '❌ **Acceso Denegado:** Solo el equipo de Staff puede cerrar los tickets.', ephemeral: true });

            const confirmarBtn = new ButtonBuilder().setCustomId('confirmar_cierre').setLabel('Sí, cerrar ticket').setStyle(ButtonStyle.Danger);
            const cancelarBtn = new ButtonBuilder().setCustomId('cancelar_cierre').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
            const filaConf = new ActionRowBuilder().addComponents(confirmarBtn, cancelarBtn);
            
            await interaction.reply({ content: '¿Estás seguro de que quieres cerrar este ticket?', components: [filaConf] });
        }
        else if (interaction.customId === 'cancelar_cierre') {
            await interaction.message.delete();
        }
        else if (interaction.customId === 'confirmar_cierre') {
            await interaction.reply({ content: '🔒 Cerrando y archivando ticket...' });
            const canal = interaction.channel;
            await canal.setParent(CAT_REGISTRO, { lockPermissions: false });
            await canal.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false });
            
            const embedCierre = new EmbedBuilder().setColor('Red').setDescription('# 🔒 Ticket Archivado\nEste ticket ha sido cerrado. Solo el **Owner** puede eliminar este canal manualmente.');
            await canal.send({ embeds: [embedCierre] });
        }
    }
});

async function crearCanalTicket(interaction, tipo, detalles) {
    if (!interaction.isModalSubmit()) await interaction.deferReply({ ephemeral: true });

    const permisos = [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, 
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, 
    ];
    ROLES_STAFF.forEach(rolId => permisos.push({ id: rolId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }));

    const canal = await interaction.guild.channels.create({
        name: `${tipo.toLowerCase()}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CAT_TICKETS,
        permissionOverwrites: permisos
    });

    const embedTicket = new EmbedBuilder().setColor('Green').setDescription(`# 🎫 Ticket de ${tipo}\nHola <@${interaction.user.id}>, el equipo de Tmb Studio te atenderá en breve.\n\n### 📋 Información proporcionada:\n> ${detalles.split('\n').join('\n> ')}`);
    const btnCerrar = new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒');
    const filaBoton = new ActionRowBuilder().addComponents(btnCerrar);
    const mencionesStaff = ROLES_STAFF.map(id => `<@&${id}>`).join(' ');

    await canal.send({ content: `<@${interaction.user.id}> | ${mencionesStaff}`, embeds: [embedTicket], components: [filaBoton] });

    if (interaction.isModalSubmit()) {
        await interaction.reply({ content: `✅ Tu ticket ha sido creado: ${canal}`, ephemeral: true });
    } else {
        await interaction.editReply({ content: `✅ Tu ticket ha sido creado: ${canal}` });
    }
}

// === PARACAÍDAS ANTI-CRASHEOS ===
process.on('unhandledRejection', error => {
    console.error('Error capturado para evitar el cierre del bot:', error);
});

client.login(process.env.TOKEN);
