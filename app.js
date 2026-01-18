const { createApp } = Vue;

createApp({
    data() {
        return {
            // Gestione Viste
            currentView: 'intro',
            
            // Dati
            dashboardData: { cards: [], paesi: [] }, // Inizializzato vuoto per evitare errori
            myResources: [],
            searchQuery: '',
            
            // Stato Modale CRUD
            showModal: false,
            isEditing: false,
            editIndex: null,
            
            // Form
            form: { titolo: '', url: '', categoria: 'Libreria', descrizione: '' },
            categorie: ['Libreria', 'Framework', 'Tutorial', 'Tool', 'Comunità', 'Altro']
        }
    },
    
    computed: {
        // 1. Logica Ricerca (CRUD)
        filteredResources() {
            if (!this.searchQuery) return this.myResources;
            const query = this.searchQuery.toLowerCase();
            return this.myResources.filter(res => 
                res.titolo.toLowerCase().includes(query) || 
                res.categoria.toLowerCase().includes(query)
            );
        },

        // 2. Logica Grafico (Trova il valore massimo)
        maxSviluppatori() {
            // Se i dati non sono ancora caricati, ritorna 100 per sicurezza
            if (!this.dashboardData.paesi || this.dashboardData.paesi.length === 0) return 100;
            // Matematica: estrae tutti i numeri e trova il più grande
            return Math.max(...this.dashboardData.paesi.map(p => p.sviluppatori));
        }
    },

    mounted() {
        this.loadJsonData();
        this.loadFromLocalStorage();
    },

    methods: {
        // --- DATA LOADING ---
        async loadJsonData() {
            try {
                const response = await fetch('risorse.json');
                const data = await response.json();
                this.dashboardData = data.dashboard; 
            } catch (error) {
                console.error("Errore JSON:", error);
            }
        },

        loadFromLocalStorage() {
            const stored = localStorage.getItem('svelte_resources_v2');
            if (stored) this.myResources = JSON.parse(stored);
        },

        syncStorage() {
            localStorage.setItem('svelte_resources_v2', JSON.stringify(this.myResources));
        },

        // --- GRAFICO DINAMICO ---
        calcolaLunghezzaBarra(valore) {
            if (!this.maxSviluppatori) return 0;
            // Proporzione: (valore / massimo) * 100
            return Math.round((valore / this.maxSviluppatori) * 100);
        },

        // --- CRUD ACTIONS ---
        openAddModal() {
            this.isEditing = false;
            this.form = { titolo: '', url: '', categoria: 'Libreria', descrizione: '' };
            this.showModal = true;
        },

        openEditModal(item) {
            this.isEditing = true;
            this.editIndex = this.myResources.indexOf(item);
            this.form = { ...item };
            this.showModal = true;
        },

        saveResource() {
            if (!this.form.titolo || !this.form.url) {
                alert("Titolo e URL sono obbligatori");
                return;
            }
            if (this.isEditing) {
                this.myResources[this.editIndex] = { ...this.form };
            } else {
                this.myResources.push({ ...this.form });
            }
            this.syncStorage();
            this.showModal = false;
        },

        deleteResource(item) {
            if (confirm(`Eliminare ${item.titolo}?`)) {
                const index = this.myResources.indexOf(item);
                this.myResources.splice(index, 1);
                this.syncStorage();
            }
        }
    }
}).mount('#app');