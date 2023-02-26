'use strict'

/*
--- CLASSES ---
 */

/*
--- Classe Note ---
 */
class Note
{
    constructor(titre, contenu, date_creation = new Date())
    {
        this.titre = titre;
        this.contenu = contenu;
        this.date_creation = date_creation;

        if (titre === "") this.setDefaultName();
    }

    setTitre(titre)
    {
        this.titre = titre;
    }

    setContenu(contenu)
    {
        this.contenu = contenu;
    }

    setDateCreation(date)
    {
        this.date_creation = date;
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
                res = "Modifiée le " + dd + "/" + mm + "/" + yyyy + " à " + hh + ":" + mn + ":" + ss;
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

    masquerHtml()
    {
        document.querySelector('#currentNoteView').innerHTML = "";
    }
}

/*
--- Classe NoteList ---
 */
class NoteList
{
    constructor() {
        //localStorage.clear();
        //if (this.listeNotes === null)
        //console.log(this.listeNotes)
        this.listeNotes = [];
        this.load();
    }

    addNote(note)
    {
        this.listeNotes.push(note);
        this.save();
    }

    delNote(noteId)
    {
        if (noteId > -1) { // only splice array when item is found
            this.listeNotes.splice(noteId, 1); // 2nd parameter means remove one item only
            this.save();
        }
    }

    editNote(noteId, newNote)
    {
        if (noteId > -1) {
            this.listeNotes[noteId] = newNote;
            this.save();
        }
    }

    getIdByNote (note)
    {
        for (let i = 0 ; i < this.listeNotes.length ; i ++) {
            if (this.listeNotes[i] === note)
                return i;
        }
    }

    getNoteById (i)
    {
        return this.listeNotes[i];
    }

    getList()
    {
        return this.listeNotes;
    }

    save()
    {
        console.log(this.listeNotes)
        console.log(JSON.stringify(this))
        localStorage.setItem("listeNotes", JSON.stringify(this.listeNotes));
        console.log(JSON.parse(localStorage.getItem("listeNotes")))
    }

    load()
    {
        let jl = JSON.parse(localStorage.getItem("listeNotes"));
        console.log(jl);
        if (jl === null) return;
        for (let i = 0 ; i < jl.length ; i ++) {
            console.log(jl[i]);
            this.listeNotes.push(new Note(jl[i].titre, jl[i].contenu, new Date(jl[i].date_creation)));
        }
    }

    getLength()
    {
        return this.listeNotes.length;
    }
}


/*
--- OBJETS ---
 */

/*
--- Objet représentant la liste des notes créées ---
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

    removeCurrentItem()
    {
        const elt = document.querySelector(".note_list_item-selected");
        elt.remove();
    },

    modifyCurrentItem(note)
    {
        const elt = document.querySelector(".note_list_item-selected");
        elt.querySelector("p").innerHTML = note.titre;
        elt.querySelector("small").innerHTML = note.defaultDate(1);
    },

    unselectAllItems()
    {
        for (let noteListMenuElement of this.noteListMenu.childNodes) {
            noteListMenuElement.classList.remove("note_list_item-selected");
        }
    },

    noteSelection() {
        return function (e) {
            let cible = e.target;
            while (!cible.classList.contains("note_list_item")) {
                cible = e.target.parentNode;
            }

            let nodes = e.currentTarget.childNodes;
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].classList.remove('note_list_item-selected');
                if (nodes[i] === cible) {
                    etatGlobal.indexNoteCourante = i;
                    let note = etatGlobal.listNote.getNoteById(i);
                    let vueNote = new NoteView(note);
                    vueNote.afficherHtml();
                }
            }
            cible.classList.add('note_list_item-selected');
            noteFormView.hide();
            noteFormView.clear();
        };
    },

    noteInit(noteList)
    {
        for (let i = 0; i < noteList.getList().length; i++) {
            this.displayItem(noteList.getNoteById(i));
        }

    },

    init()
    {
        console.log("Initialisation de la liste de notes")
        document.querySelector('#noteListMenu').onclick =
            noteListMenuView.noteSelection();
        noteListMenuView.noteInit(etatGlobal.listNote);
    }
}

/*
--- Objet représentant le formulaire d'édition d'une note ---
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

    clear()
    {
        document.getElementById("form_add_note_title").value = "";
        document.getElementById("form_add_note_text").value = "";
    },

    edit()
    {
        const n = etatGlobal.listNote.getNoteById(etatGlobal.indexNoteCourante);
        document.getElementById("form_add_note_title").value = n.titre;
        document.getElementById("form_add_note_text").value = n.contenu;
        noteFormView.display();
    },

    create()
    {
        etatGlobal.indexNoteCourante = etatGlobal.listNote.getLength();
        noteFormView.display();
    },

    validate() {
        console.log("Clic: Valider le formulaire")
        noteFormView.hide();
        let titre = document.querySelector('#form_add_note_title').value;
        let contenu = document.querySelector('#form_add_note_text').value;
        let note = new Note(titre, contenu);

        if (etatGlobal.indexNoteCourante < etatGlobal.listNote.getLength())
        {
            console.log("ON MODIFIE")
            console.log("Etat !:" +  etatGlobal.indexNoteCourante)
            console.log(note)
            etatGlobal.listNote.editNote(etatGlobal.indexNoteCourante, note);
            noteListMenuView.modifyCurrentItem(note);
        }
        else
        {
            console.log("ON CREE")
            etatGlobal.listNote.addNote(note);
            console.log("Etat !:" +  etatGlobal.indexNoteCourante);
            noteListMenuView.displayItem(note);
        }


        let vueNote = new NoteView(note);
        vueNote.afficherHtml();

        noteFormView.clear();
        this.isEditing = false;
        console.log(etatGlobal.listNote.getList()/*.length*/)
        console.log("Formulaire validé");
    }
};

/*
--- Objet représentant le menu de navigation ---
 */
let mainMenuView = {
    addHandler()
    {
        console.log("Clic: Nouvelle note");
        noteFormView.create();
        //noteFormView.isEditing = false;
        document.querySelector("#currentNoteView").innerHTML = "";
    },

    delHandler()
    {
        console.log("Clic: Supprimer la note courante");
        let noteId = etatGlobal.indexNoteCourante;
        etatGlobal.listNote.delNote(noteId);
        let note = etatGlobal.listNote.getNoteById(noteId);
        noteListMenuView.removeCurrentItem();
        document.querySelector("#currentNoteView").innerHTML = "";
    },

    editHandler()
    {
        console.log("Clic: Modifier la note courante");
        noteFormView.edit();
        //noteFormView.isEditing = true;
        document.querySelector("#currentNoteView").innerHTML = "";
    },

    init()
    {
        console.log("Initialisation du menu");
        document.querySelector('#add').onclick = this.addHandler;
        document.querySelector('#del').onclick = this.delHandler;
        document.querySelector('#edit').onclick = this.editHandler;
        document.querySelector('#form_add_note_valid').onclick = noteFormView.validate;
    }
}

/*
--- Objet représentant l'état global de l'application ---
 */
let etatGlobal = {
    listNote : null,
    indexNoteCourante : null,

    init()
    {
        mainMenuView.init();
        etatGlobal.listNote = new NoteList();
        noteListMenuView.init();
    }
}


/*
--- INITIALISATION ---
 */
window.onload = etatGlobal.init;
