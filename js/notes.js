'use strict'

/*
--- Classe Note ---
 */
class Note
{
    constructor(titre, contenu)
    {
        this.titre = titre;
        this.contenu = contenu;
        this.date_creation = new Date();
    }

    setTitre(titre)
    {
        this.titre = titre;
    }

    setContenu(contenu)
    {
        this.contenu = contenu;
    }

    setDefaultName()
    {
        this.titre = this.defaultDate();
    }

    defaultDate(format = 0)
    {
        let dc = this.date_creation;

        const yyyy = dc.getFullYear();
        let mm = dc.getMonth() + 1; // Les mois commencent à 0 !
        let dd = dc.getDate();
        let hh = dc.getHours();
        let mn = dc.getMinutes();
        let ss = dc.getSeconds();

        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;
        if (hh < 10) hh = '0' + hh;
        if (mn < 10) mn = '0' + mn;
        if (ss < 10) ss = '0' + ss;

        let res;
        switch (format) {
            case 1 :
                res = "Créée le " + dd + "/" + mm + "/" + yyyy + " à " + hh + ":" + mn + ":" + ss;
                break;
            case 0 :
                res = yyyy + "-" + mm + "-" + dd + "_" + hh + "-" + mn + "-" + ss;
                break;
        }
        return res;
    }
}


/*
--- Classe NoteView ---
 */
class NoteView
{
    constructor(note)
    {
        this.note = note;
        this.noteHtml = "";
    }

    convertirMd2Html()
    {
        let conv = new showdown.Converter();
        return conv.makeHtml(this.note.contenu);
    }

    afficherHtml()
    {
        this.noteHtml = this.convertirMd2Html();
        document.querySelector('#currentNoteView').innerHTML =
            "<h1>" + this.note.titre + "</h1><p>" + this.noteHtml + "</p>";
    }
}

/*
--- Objet noteListMenuView ---
 */
let noteListMenuView = {
    noteListMenu: document.querySelector("#noteListMenu"),

    displayItem(note)
    {
        this.unselectAllItems();

        let div = document.createElement("div");
        div.setAttribute("class","note_list_item note_list_item-selected");

        let pTitre = document.createElement("p");
        let pDate = document.createElement("small");

        let noeudTitre = document.createTextNode(note.titre);
        let noeudDate = document.createTextNode(note.defaultDate(1));

        pTitre.appendChild(noeudTitre);
        pDate.appendChild(noeudDate);

        div.appendChild(pTitre);
        div.appendChild(pDate);
        this.noteListMenu.appendChild(div);

    },

    unselectAllItems()
    {
        for (let noteListMenuElement of this.noteListMenu.childNodes) {
            noteListMenuElement.classList.remove("note_list_item-selected");
        }
    }
}

/*
--- Objet noteFormView ---
 */
let noteFormView = {
    form: document.querySelector(".create_edit_note").classList,

    display() {
        console.log("Afficher le formulaire");
        this.form.remove("create_edit_note-hidden");
    },

    hide() {
        console.log("Masquer le formulaire");
        this.form.add("create_edit_note-hidden");
    },

    validate() {
        console.log("Clic: Valider le formulaire")
        let titre = document.querySelector('#form_add_note_title').value;
        let contenu = document.querySelector('#form_add_note_text').value;
        let note = new Note(titre, contenu);
        if (titre === "") note.setDefaultName();

        etatGlobal.indexNoteCourante = etatGlobal.listNote.addNote(note);
        noteListMenuView.displayItem(note);

        let vueNote = new NoteView(note);
        vueNote.afficherHtml()
        console.log("Formulaire validé")

    }
};

/*
--- Objet mainMenuView ---
 */
let mainMenuView = {
    addHandler()
    {
        console.log("Clic: ajout d'une note");
        noteFormView.display();
    },

    init()
    {
        console.log("Initialisation du menu")
        document.querySelector('#add').onclick = this.addHandler;
        document.querySelector('#form_add_note_valid').onclick = noteFormView.validate;
    }
}


/*
--- Objet etatGlobal ---
 */
let etatGlobal = {
    listNote : null,
    indexNoteCourante : null,

    init()
    {
        mainMenuView.init();
        etatGlobal.listNote = new NoteList();

        document.querySelector('#noteListMenu').onclick =
            function (e)
            {
                let nodes = e.currentTarget.childNodes;
                for (let i = 0 ; i < nodes.length ; i++)
                {
                    nodes[i].classList.remove('note_list_item-selected');
                    if(nodes[i] === e.target){
                        let note = etatGlobal.listNote.getNoteById(i);
                        let vueNote = new NoteView(note);
                        vueNote.afficher();
                    }
                }
                e.target.classList.add('note_list_item-selected');

            };
    }
}


/*
--- Classe NoteListe ---
 */
class NoteList
{
    constructor() {
        this.listeNotes = [];
    }

    addNote(note)
    {
        this.listeNotes.push(note);
    }

    getNoteById (i)
    {
        return this.listeNotes[i];
    }

    getList()
    {
        return this.listeNotes;
    }
}


window.onload = etatGlobal.init;