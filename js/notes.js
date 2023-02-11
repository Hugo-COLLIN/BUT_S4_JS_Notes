'use strict'

/*
--- Classe Note ---
 */

class Note
{
    constructor(titre, contenu) {
        this.titre = titre;
        this.contenu = contenu;
        this.date_creation = new Date();
    }
    setTitre(titre)
    {
        this.titre = titre;
    }
    setContenu(texte)
    {
        this.contenu = contenu;
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
        return  conv.makeHtml(this.note.contenu);
    }
    afficherHtml()
    {
        this.noteHtml = this.convertirMd2Html();
        document.querySelector('#currentNoteView').innerHTML = `<h1>${this.note.titre}
        </h1> <p>${this.noteHtml}</p>`;
    }
}

/*
--- Objet noteListMenuView ---
 */
let noteListMenuView = {
    displayItem(note){
        let section_noteList = document.querySelector("#noteListMenu");
        let p = document.createElement("div");
        p.setAttribute("class","note_list_item");

        let titre = note.titre;
        if(note.titre === ""){
            titre = "Titre";
        }


        let titre_noteList = document.createTextNode(titre);
        p.appendChild(titre_noteList);
        section_noteList.appendChild(p);

    }
}

/*
--- Objet noteFormView ---
 */
let noteFormView = {
    form: document.querySelector(".create_edit_note").classList,

    display() {
        this.form.remove("create_edit_note-hidden");
    },

    hide() {
        this.form.add("create_edit_note-hidden");
    },

    validate() {
        let titre = document.querySelector('#form_add_note_title').value;
        let contenu = document.querySelector('#form_add_note_text').value;
        let note = new Note(titre, contenu);

        //etatGlobal.indexNoteCourante = etatGlobal.listNote.addNote(note);
        //noteListMenuView.displayItem(note);

        let vueNote = new NoteView(note);
        vueNote.afficherHtml()
        //form.
    }
};

/*
--- Objet mainMenuView ---
 */
let mainMenuView = {
    addHandler() {
        console.log('Clic ajout note');
        noteFormView.display();
    },
    init(){
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

    init(){
        mainMenuView.init();
        etatGlobal.listNote = new NoteList();


        document.querySelector('#noteListMenu').onclick =
            function (e)
            {
                let nodes = e.currentTarget.childNodes;
                for (let i = 0 ; i < nodes.length ; i++){
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