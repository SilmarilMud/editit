/* section-help.js - First-time section help dialogs */

/**
 * Simple markdown-to-HTML converter.
 * Supports: **bold**, `code`, - list items, blank line = paragraph break.
 * @param {string} md - Markdown text
 * @returns {string} HTML
 */
function mdToHtml(md) {
    const lines = md.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Blank line: close list if open, add paragraph break
        if (trimmed === '') {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            continue;
        }

        // List item
        if (trimmed.startsWith('- ')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${inlineFormat(trimmed.slice(2))}</li>`;
            continue;
        }

        // Close list if we hit non-list content
        if (inList) {
            html += '</ul>';
            inList = false;
        }

        // Regular paragraph line
        html += `<p>${inlineFormat(trimmed)}</p>`;
    }

    if (inList) html += '</ul>';
    return html;
}

/**
 * Format inline markdown: **bold** and `code`
 */
function inlineFormat(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
}

/**
 * Help text for each section, in Italian.
 * Keys match the section IDs used in main.js.
 */
const SECTION_HELP_TEXT = {
    'area': {
        icon: '🗺️',
        title: 'Impostazioni Area',
        text: `Questa è la scheda delle impostazioni generali dell'area. Da qui puoi configurare:

- **Nome e autore** — il nome apparisce nella lista delle aree del MUD e nel comando \`areas\`
- **VNum iniziale** — il primo numero VNum assegnato a stanze, mob e oggetti di questa area. Tutti gli enti devono avere VNum univoci
- **VNum richiamo** — la stanza dove i giocatori risalgono quando usano il comando \`recall\` (0 = usa il default del MUD)
- **Fascia di livello** — il livello minimo e massimo consigliato per questa area, usato dal comando \`areas\`
- **Flag area** — controlla comportamenti speciali come battlefield, no-quit, o invisibile nella mappa
- **Piano** — il "piano dimensionale" dell'area (es. Terra, Aether, Inferno)

Usa **Shift VNums** in basso per spostare tutti i numeri VNum di un offset, utile quando due aree si sovrappongono.`
    },

    'rooms-stats': {
        icon: '📊',
        title: 'Statistiche Stanze',
        text: `Panoramica di tutte le stanze dell'area.

- **Totale stanze** — il numero complessivo di stanze definite
- **Range VNum** — l'intervallo di VNum utilizzati
- **Con descrizione** — quante stanze hanno un testo descrittivo visibile ai giocatori
- **Per tipo di settore** — distribuzione delle stanze per ambiente (foresta, dungeon, città, ecc.)

Puoi fare doppio clic su una stanza nell'albero a sinistra per aprirla e modificarla.`
    },

    'mobs-stats': {
        icon: '📊',
        title: 'Statistiche Mob',
        text: `Panoramica di tutti i mob dell'area.

- **Totale mob** — il numero complessivo di mob definiti
- **Range VNum** — l'intervallo di VNum utilizzati
- **Livello medio** — il livello medio dei mob, con il range minimo e massimo
- **Oro totale** — la somma dell'oro che tutti i mob dell'area portano
- **Bottegai** — i mob configurati come negozianti (hanno una scheda negozio)
- **Con special** — i mob a cui è associata una funzione speciale

Puoi fare doppio clic su un mob nell'albero a sinistra per aprirlo e modificarlo.`
    },

    'objects-stats': {
        icon: '📊',
        title: 'Statistiche Oggetti',
        text: `Panoramica di tutti gli oggetti dell'area.

- **Totale oggetti** — il numero complessivo di oggetti definiti
- **Range VNum** — l'intervallo di VNum utilizzati
- **Peso medio** — il peso medio degli oggetti, con il peso totale
- **Costo medio** — il costo medio degli oggetti, con il costo totale
- **Per tipo** — distribuzione degli oggetti per categoria (arma, armatura, scudo, ecc.)

Puoi fare doppio clic su un oggetto nell'albero a sinistra per aprirlo e modificarlo.`
    },

    'helps-stats': {
        icon: '📊',
        title: 'Statistiche Help',
        text: `Panoramica di tutte le voci di help dell'area.

- **Totale voci** — il numero complessivo di voci di help
- **Range livelli** — l'intervallo di livelli delle voci
- **Con descrizione** — quante voci hanno un testo descrittivo (non vuote)
- **Lunghezza media keyword** — la lunghezza media delle keyword di ricerca

Le voci di help vengono mostrate ai giocatori quando usano il comando \`help\`. Ogni voce ha un livello minimo e una lista di keyword che ne determinano l'attivazione.`
    },

    'shops-stats': {
        icon: '📊',
        title: 'Statistiche Negozi',
        text: `Panoramica di tutti i negozi dell'area.

- **Totale negozi** — il numero di bottegai configurati
- **Profitto medio acquisto/vendita** — le percentuali medie di markup/markdown
- **Orari di apertura** — l'intervallo orario coperto dai negozi
- **Tipi commerciali** — distribuzione delle categorie merceologiche accettate

I negozi sono mob con la proprietà "Negziante" attiva. Per configurare un negozio, apri il mob corrispondente e vai nella scheda "Negozio".`
    },

    'resets': {
        icon: '🔄',
        title: 'Reset Area',
        text: `I reset controllano cosa viene generato automaticamente nell'area quando viene caricata o quando un giocatore entra.

- **M** (Mobile) — posiziona un mob in una stanza
- **O** (Object) — posiziona un oggetto in una stanza
- **G** (Give) — mette un oggetto nell'inventario di un mob
- **E** (Equip) — equipaggia un oggetto su un mob
- **P** (Put) — mette un oggetto dentro un contenitore (altro oggetto)
- **D** (Door) — imposta la chiusura di una porta
- **R** (Room) — rimuove un oggetto da una stanza (usa raramente)

I reset vengono eseguiti in ordine. Per modificare l'ordine, usa il drag-and-drop o i pulsanti su ogni riga.

**Nota:** i mob e gli oggetti devono essere definiti prima di poterli usare nei reset.`
    },

    'specials': {
        icon: '✨',
        title: 'Special Program',
        text: `Gli special associano funzioni speciali ai mob dell'area. Queste funzioni definiscono comportamenti particolari come dialoghi, vendita di oggetti, o reazioni a eventi.

- Seleziona un mob dalla lista qui sotto
- Scegli la funzione speciale dal menu a tendina
- La funzione verrà applicata al mob selezionato

Le funzioni speciali sono definite nel codice sorgente del MUD. Solo le funzioni esistenti nel codice possono essere assegnate. Se non vedi la funzione che cerchi, potrebbe non essere ancora stata implementata.

**Nota:** ogni mob può avere solo una funzione speciale alla volta. Se ne assegni una nuova, quella precedente viene sostituita.`
    },

    'room': {
        icon: '🚪',
        title: 'Stanza',
        text: `Questa è la scheda di una singola stanza. Da qui puoi modificare:

- **Nome** — il nome breve della stanza, usato nei comandi e nelle descrizioni
- **Descrizione** — il testo che i giocatori vedono quando entrano nella stanza
- **Settore** — il tipo di ambiente (foresta, dungeon, città, acqua, ecc.)
- **Flags** — attributi speciali della stanza (dark, no_magic, indoor, ecc.)
- **Uscite** — le connessioni verso altre stanze in ogni direzione (nord, sud, est, ovest, ecc.)
- **Descrizioni extra** — testi aggiuntivi visibili con il comando \`look <keyword>\`

Ogni uscita ha un VNum di destinazione, una chiave, una descrizione e delle porte con flag. Le uscite inverse vengono create automaticamente con il pulsante **Inverti**.`
    },

    'mob': {
        icon: '👤',
        title: 'Mobile',
        text: `Questa è la scheda di un singolo mobile. Da qui puoi modificare:

- **Nome lungo** — la frase completa che appare quando il mob viene esaminato (es. "il grande drago rosso")
- **Nome corto** — il nome breve usato come intestazione (es. "un grande drago rosso")
- **Descrizione** — il testo che i giocatori vedono quando guardano il mob
- **Livello** — il livello del mob, determina forza e difficoltà
- **Statistiche** — punti vita, punti danno, oro, esperienza
- **Posizione** — la posizione in cui il mob viene caricato (stante, seduto, ecc.)
- **Sesso** — genere del mob (maschile, femminile, neutro)
- **Flags** — attributi speciali (aggressivo, assistance, sentinel, ecc.)
- **Applicazioni** — effetti che il mob applica ai giocatori (parola, zona, ecc.)
- **Resistenze** — resistenze e vulnerabilità del mob a danni e magie

Il **Negozio** e il **Special** vengono configurati dalle schede dedicate.`
    },

    'object': {
        icon: '📦',
        title: 'Oggetto',
        text: `Questa è la scheda di un singolo oggetto. Da qui puoi modificare:

- **Nome lungo** — la frase completa (es. "una spada di ferro rovinata")
- **Nome corto** — il nome breve come intestazione (es. "una spada di ferro")
- **Descrizione** — il testo che appare quando un giocatore esamina l'oggetto
- **Tipo** — la categoria dell'oggetto (arma, armatura, scudo, cibo, pozione, ecc.)
- **Peso e costo** — le proprietà fisiche e il valore economico
- **Wear flags** — dove l'oggetto può essere equipaggiato (mano, testa, petto, ecc.)
- **Flags** — attributi speciali (glow, hum, evil, invent, ecc.)
- **Valori** — valori specifici per tipo (danni per armi, durata per cibo, ecc.)
- **Applicazioni** — effetti che l'oggetto applica quando è equipaggiato
- **Descrizioni extra** — testi aggiuntivi visibili con \`look <keyword>\`

Gli oggetti vengono posizionati nell'area tramite i **Reset**.`
    },

    'help': {
        icon: '❓',
        title: 'Voce Help',
        text: `Questa è una voce della guida del gioco. Da qui puoi modificare:

- **Livello** — il livello minimo richiesto per consultare questa voce (0 = tutti)
- **Keyword** — le parole chiave che i giocatori usano con il comando \`help\` (es. "magic magiche incantesimi")
- **Testo** — il contenuto della guida, mostrato al giocatore quando cerca aiuto

Le keyword vengono separate da spazi. Quando un giocatore digita \`help <keyword>\`, il MUD cerca la voce con la keyword più lunga che corrisponde.

**Nota:** il testo può essere multiparagrafo. Usa una riga vuota per separare i paragrafi.`
    },

    'shop': {
        icon: '🏪',
        title: 'Negozio',
        text: `Questa è la scheda negozio di un bottegaio. Da qui puoi configurare:

- **Profitto acquisto/vendita** — le percentuali di markup: quanto il negozio paga di meno quando compra e charge di più quando vende (100 = prezzo pieno)
- **Ore di apertura** — l'intervallo orario in cui il negozio è aperto (0-23)
- **Tipi commerciali** — le categorie di oggetti che il negozio accetta (armi, armature, cibo, ecc.)

Un negozio è un mob con la proprietà "Negziante" attiva. Il mob deve esistere prima di poter configurare il negozio.

Per rimuovere un negozio, disattiva la proprietà "Negziante" nella scheda del mob.`
    }
};

/**
 * Show a section help dialog (full-window, like About).
 * Creates a <dialog>, shows it modally, removes it on close.
 *
 * @param {string} sectionId - Section identifier (e.g., 'area', 'resets')
 */
export function showSectionHelp(sectionId) {
    const help = SECTION_HELP_TEXT[sectionId];
    if (!help) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'section-help-dialog';
    dialog.innerHTML = `
        <article>
            <header>
                <button class="close" rel="prev"></button>
                <h3>${help.icon} ${help.title}</h3>
            </header>
            <div class="section-help-body">
                ${mdToHtml(help.text)}
            </div>
            <footer>
                <button class="section-help-close-btn secondary">Chiudi</button>
            </footer>
        </article>
    `;

    document.body.appendChild(dialog);

    // Close handlers
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.section-help-close-btn').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialog.remove());

    dialog.showModal();
}
