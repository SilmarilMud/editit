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

**Area name e Author** - I nomi indicati compaiono nel comando \`aree\`.
**Starting VNum** - Questo numero va concordato con gli Antichi.
**Recall VNum** - E' la stanza in cui vanno i giocatori che usano ritorna. Usa \`0\` se non serve.
**Level Range** - Il livello minimo e massimo consigliato per questa area, mostrato nel comando \`aree\`. Indica la difficoltà, in genere dipende dai livello minimo e massimo dei mob creati.
**Plane** - Il piano dimensionale dell'area.
**Music File** - Nome dell'eventuale file colonna sonora dell'area.
**Reset Message** - Messaggio opzionale che compare quando l'area si rinnova.
**Area Flags** - Muovi il cursore sui nomi (o selezionali su cellulare) per mostrare la descrizione.`
    },

    'rooms-stats': {
        icon: '📊',
        title: 'Statistiche Stanze',
        text: `Panoramica di tutte le stanze dell'area.

- **Creare stanze** - Clicca col tasto destro su **Rooms** (o premi a lungo su cellulare) e seleziona **Add**. Dallo stesso menù è possibile **rimuovere** o **duplicare** una stanza.
- **With description** - Il numero di stanze senza descrizione (empty) deve essere 0.
- **By sector type** - Sommario della distribuzione delle stanze per ambiente

Seleziona una stanza nell'albero a sinistra per aprirla e modificarla.`
    },

    'mobs-stats': {
        icon: '📊',
        title: 'Statistiche Mob',
        text: `Panoramica di tutti i mob dell'area.

- **Creare mob** - Clicca col tasto destro su **Mobiles** (o premi a lungo su cellulare) e seleziona **Add**. Dallo stesso menù è possibile **rimuovere** o **duplicare** un mob.
- **Average level** - Livello medio dei mob, con il range minimo e massimo per verificare se il livello indicato per l'area è corretto.
- **Total gold** - La somma dell'oro posseduto da tutti i mob dell'area. Il valore dovrebbe essere concordato per evitare sbilanciamenti all'economia.
- **Shopkeepers** - Numero dei mob configurati come negozianti.
- **With specials** - Numero dei mob a cui è associata una procedura speciale.
- **By Alignment** - Distribuzione del numero di mob per allineamento.

Seleziona un mob nell'albero a sinistra per aprirlo e modificarlo.`
    },

    'objects-stats': {
        icon: '📊',
        title: 'Statistiche Oggetti',
        text: `Panoramica di tutti gli oggetti dell'area.

- **Creare oggetti** - Clicca col tasto destro su **Objects** (o premi a lungo su cellulare) e seleziona **Add**. Dallo stesso menù è possibile **rimuovere** o **duplicare** un oggetto.
- **Average weight** - Peso totale e medio degli oggetti creati.
- **Average cost** - Costo totale e medio degli oggetti creati.
- **By Type** - Distribuzione degli oggetti per categoria.

Seleziona un oggetto nell'albero a sinistra per aprirlo e modificarlo.`
    },

    'helps-stats': {
        icon: '📊',
        title: 'Statistiche Help',
        text: `Panoramica di tutte le voci di help dell'area.

- **Creare help** - Clicca col tasto destro su **Helps** (o premi a lungo su cellulare) e seleziona **Add**. Dallo stesso menù è possibile **rimuovere** o **duplicare** una voce di help.

Le voci di help vengono mostrate ai giocatori quando usano il comando \`aiuto\`. Ogni voce ha un livello minimo e una lista di keyword che ne determinano l'attivazione. Seleziona un help nell'albero a sinistra per aprirlo e modificarlo.`
    },

    'shops-stats': {
        icon: '📊',
        title: 'Statistiche Negozi',
        text: `Panoramica di tutti i negozi dell'area.

- **Creare negozio** - I negozi vengono creato attivando il box **Is Shop Keeper** nel tab **Shop** di un mob.
- **Total Shops** - Numero di negozianti nell'area.
- **Avg Profit Buy/Sell** - Percentuali medie di acquisto e vendita.
- **Opening hours** - Ore della giornata in cui i negozi sono aperti.

Seleziona un negozio nell'albero a sinistra per aprirlo e modificarlo. Se vuoi rimuovere un negozio, disattiva il box **Is Shop Keeper** nei dettagli del mob corrispondente.`
    },

    'resets': {
        icon: '🔄',
        title: 'Reset Area',
        text: `I reset controllano cosa viene generato automaticamente nell'area quando viene caricata o quando l'area si rigenera.

- **M** (Mobile) - Posiziona un mob in una stanza.
- **O** (Object) - Posiziona un oggetto in una stanza.
- **G** (Give) - Mette un oggetto nell'inventario di un mob.
- **E** (Equip) - Equipaggia un oggetto su un mob.
- **P** (Put) - Mette un oggetto dentro un contenitore (altro oggetto).
- **D** (Door) - Imposta lo stato di una porta.
- **R** (Room) - Rende casuale la connessione tra le stanze (labirinti). Usato raramente.

**Nota:** i mob e gli oggetti devono essere definiti prima di poterli usare nei reset.`
    },

    'specials': {
        icon: '✨',
        title: 'Funzioni speciali',
        text: `Le special functions associano funzioni speciali ai mob dell'area. Queste funzioni definiscono comportamenti particolari come combattimento, reazioni, interazione, ecc.

- Seleziona un mob dalla lista Mobiles (completo) o Specials (rapido).
- Scegli la funzione speciale dal menu a tendina. Muovi il cursore sul nome (o selezionalo su cellulare) per vedere la descrizione.

Le funzioni speciali sono definite nel codice sorgente del MUD. Se nessuna funzione speciale definisce correttamente un mob che hai creato, parlane con gli Antichi.

**Nota:** ogni mob può avere solo una funzione speciale alla volta. Se ne assegni una nuova, quella precedente viene sostituita.`
    },

    'room': {
        icon: '🚪',
        title: 'Stanza',
        text: `Questa è la scheda di una singola stanza. Da qui puoi modificare:

- **Basic** - Nome, descrizione, tipo di settore ed attributi della stanza. Muovi il cursore (o seleziona su cellulare) sui nomi degli attributi per vedere la descrizione. **Reset Only** è utile per le stanze che non sono disponibili ai giocatori, ma contengono solo mob oppure oggetti utili per altro.
- **Exits** - Definisce le connessioni tra le stanze. Ogni direzione può essere collegata ad un'altra stanza di questa o altre aree, definire la presenza di una porta ed impostarne gli attributi. Muovi il cursore (o seleziona su cellulare) sui nomi degli attributi per vedere la descrizione.  **Create/Update reverse exit** crea l'uscita corrispondente dalla stanza collegata a questa uscita.
- **Extras** - Aggiungi descrizioni extra utili per l'esplorazione dei giocatori, approfondire l'ambiente, creare quest, ecc. Possono essere lette col comando \`esamina <keyword>\`.
- **Contents** - Aggiungi oggetti o mob alla stanza. La stessa cosa può essere fatta dal menù **Resets**.`
    },

    'mob': {
        icon: '👤',
        title: 'Mobile',
        text: `Questa è la scheda di un singolo mobile. Da qui puoi modificare:

- **Basic** - Parole chiave (per interagire), descrizione breve (visibile nelle azioni), descrizione lunga (visibile nella stanza) e descrizione dettagliata (visibile quando si guarda il mob). Inoltre è possibile configurare razza e sesso, nonchè la funzione speciale opzionale (visibile e modificabile in seguito anche dal menù **Specials**). Muovi il cursore sul nome della special function (o selezionalo su cellulare) per vedere la descrizione.
- **Combat** - Livello del mob, allineamento, oro, reputazione e classe (attualmente la classe è inutilizzata).
- **Flags** - Attributi del mob. Muovi il cursore (o seleziona su cellulare) sui nomi degli attributi per vedere la descrizione.
- **Shop** - Se il mob è uno shop keeper, seleziona il tipo degli oggetti che vende e acquista, quanto varia il prezzo rispetto al valore dell'oggetto, e da che ora a che ora è aperto. I dettagli del negozio possono essere modificati anche nel menù **Shops**.`
    },

    'object': {
        icon: '📦',
        title: 'Oggetto',
        text: `Questa è la scheda di un singolo oggetto. Da qui puoi modificare:

- **Basic** - Parole chiave (per interagire), descrizione breve (visibile nelle azioni e nell'equipaggiamento), descrizione lunga (visibile quando è a terra). E' possibile seleionare anche il tipo di oggetto, la funzione speciale opzionale, il peso ed il costo. L'**azione** è un messaggio visibile quando si attivano strumenti da caccia/battaglia. I messaggi wear on/off vengono mostrati quando l'oggetto viene indossato/rimosso (se indossabile).
- **Values** - In base al tipo dell'oggetto, i values permettono di configurarne i dettagli (esempio, quante ora dura una luce, tipo di danno dell'arma, ecc.)
- **Flags** - Attributi dell'oggetto. Muovi il cursore (o seleziona su cellulare) sui nomi degli attributi per vedere la descrizione. Se indossabile, qui viene definita la parte del corpo su cui l'oggetto può essere indossato.
- **Applies** - Modifiche alle statistiche.
- **Extras** - Descrizioni extra, visibili quando il giocatore esamina le parole  chiare ad esse associate.

Gli oggetti vengono posizionati nell'area o addosso ai mob tramite i **Reset**.`
    },

    'help': {
        icon: '❓',
        title: 'Voce Help',
        text: `Questa è una voce della guida del gioco. Da qui puoi modificare:

- **Level** - Livello minimo richiesto per consultare questa voce (0 = tutti)
- **Keyword** - Lista parole chiave che i giocatori usano con il comando \`aiuto\`.
- **Text** - Contenuto della voce dell'help.

Le keyword sono separate da spazi. Quando un giocatore digita \`aiuto <keyword>\`, il MUD cerca la voce con la keyword più lunga che corrisponde.

**Nota:** il testo può essere multiparagrafo. Usa una riga vuota per separare i paragrafi.`
    },

    'shop': {
        icon: '🏪',
        title: 'Negozio',
        text: `Questa è la scheda di un negozio. Da qui puoi configurare:

- **Trade Types** - Lista del tipo di merci.
- **Profit buy/sell** - Percentuali di acquisto e vendita rispetto al valore originale dell'oggetto. Generalmente nessun negoziante vende con un buon margine!  (100 = prezzo pieno)
- **Open/Clouse Hour** - Orario di apertura di un negozio (0-23)

Un negoziante è un mob con la proprietà "Shop Keeper" attiva. Il mob deve esistere prima di poter configurare il suo negozio.

Per rimuovere un negozio, disattiva la proprietà "Shop Keeper" nella scheda del mob.`
    }
};

/**
 * Show a section help dialog (full-window, like About).
 * Creates a <dialog>, shows it modally, removes it on close.
 *
 * @param {string} sectionId - Section identifier (e.g., 'area', 'resets')
 */
const STORAGE_KEY = 'editit-section-help-enabled';

/**
 * Check if section help tips are enabled.
 * @returns {boolean}
 */
export function isSectionHelpEnabled() {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
}

/**
 * Enable or disable section help tips.
 * @param {boolean} enabled
 */
export function setSectionHelpEnabled(enabled) {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

export function showSectionHelp(sectionId, force = false) {
    if (!force && !isSectionHelpEnabled()) return;
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
