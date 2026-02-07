# Jauge Suivi Compétences — Analyse & Plan

**Date de création :** 7 février 2026  
**Statut :** Analysé, prêt pour implémentation  
**Tech stack :** Supabase + JavaScript client + LocalStorage fallback

---

## Objectif

Créer une **jauge unique** qui se remplit progressivement quand l'utilisateur coche des cases pour valider l'étude des compétences.

**Logique de couleur :**
- 🔴 **Rouge** : compétence vue 1 fois
- 🟠 **Orange** : compétence vue 2 fois
- 🟢 **Vert** : compétence maîtrisée (3 fois)

---

## Architecture décidée

### Stack technique
- **Backend :** Supabase (PostgreSQL) + RLS (Row-Level Security)
- **Frontend :** JavaScript vanilla (no framework for now)
- **Authentification :** Code unique par élève (simple, sans email)
- **Fallback :** LocalStorage pour mode offline
- **Persistance :** Supabase API REST + webhooks

### Structure données minimale

```sql
-- Table: competence_progress
CREATE TABLE competence_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- UUID ou code unique élève
  competence_id TEXT NOT NULL,  -- ex: "CO1", "CO2.1"
  check_count INT DEFAULT 0,  -- 1-3
  last_updated TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_comp UNIQUE(user_id, competence_id)
);

-- RLS Policy : élève ne voit que ses données
ALTER TABLE competence_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own data" ON competence_progress
  USING (auth.uid() = user_id);
```

---

## Composants à créer

### 1. **Module Supabase** (`supabase-client.js`)
- Initialiser client Supabase
- Fonctions : `fetchProgress()`, `updateProgress(compId, count)`, `syncToLocal()`

### 2. **Composant Jauge** (`gauge.html` + `gauge.js`)
- HTML : `<div class="gauge"><div class="fill"></div></div>`
- Logique : écoute checkboxes → calcul % global → repaint couleur

### 3. **Intégration Markdown**
- Ajouter checkboxes dans fiches compétences Markdown
- Wrapper JavaScript pour les capturer

### 4. **Authentification légère**
- Form : "Entre ton code élève"
- Store `user_id` dans sessionStorage
- Pass en header API Supabase

---

## Phases d'implémentation

| Phase | Temps | Priorité | Notes |
|-------|-------|----------|-------|
| **1. Setup Supabase** | 15m | P0 | Créer org, DB, table, RLS |
| **2. Client SDK** | 30m | P0 | Module import Supabase.js |
| **3. Auth basique** | 20m | P1 | Code élève → token session |
| **4. Jauge HTML/CSS** | 30m | P1 | Visuelle avec dégradés couleur |
| **5. Event listeners** | 30m | P2 | Checkbox → API call |
| **6. Tests + deploy** | 30m | P2 | GH Pages + SSL |
| **7. LocalStorage sync** | 15m | P3 | Fallback offline |

**Total MVP :** ~2h30 - 3h30

---

## Décisions clés prises

✅ **Supabase > Firebase** :
- PostgreSQL (scalable, querys SQL native)
- Open source (respect RGPD France)
- RLS granulaire
- Meilleur prix pour usage éducatif

✅ **Auth simple** (pas OAuth) :
- Élèves = code 4-6 chiffres fourni par prof
- Pas d'email requis
- Plus facile en classe

✅ **LocalStorage + Supabase** :
- Frontend = source de vérité (UX rapide)
- Supabase = archive (rapports prof, continuité)
- Sync bidirectionnel

---

## Prochaines étapes au reprise

1. [ ] Créer compte Supabase (gratuit)
2. [ ] Générer `SUPABASE_URL` et `SUPABASE_KEY` (public, client-side OK)
3. [ ] Copier SQL schema ci-dessus, exécuter dans Supabase console
4. [ ] Créer dossier `components/` avec `supabase-client.js`
5. [ ] Inclure dans `templates/layout.html` ou pages spécifiques
6. [ ] Tester form auth + update table
7. [ ] Build jauge visuelle
8. [ ] Intégrer dans fiches compétences

---

## Ressources

- [Supabase JS client docs](https://supabase.com/docs/reference/javascript/introduction)
- [RLS guide](https://supabase.com/docs/guides/auth/row-level-security)
- [API REST endpoint](https://supabase.com/docs/guides/api)

---

## Notes partagées de cette session

- Utilisateur : Xavier Frassinelli
- Site : Lycée Victor Hugo, programme SII-STI2D
- Dernier commit : `e7da0b1` (Mode sombre ok, v0.1.1)
- Jauge demandée : comptage + couleur progressive compétences
- Contexte : élèves valident étude multi-fois → progression récompensée visuellement

---

**Status :** ✅ Analysé et approuvé pour démarrage. Prêt à reprendre quand tu veux !
