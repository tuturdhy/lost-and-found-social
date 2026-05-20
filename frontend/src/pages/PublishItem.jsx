import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  Upload, X, MapPin, Tag, Palette, FileText,
  ChevronRight, Sparkles, Loader2, Target, ArrowLeft
} from 'lucide-react'

const CATEGORIES = ['sac', 'téléphone', 'clés', 'portefeuille', 'bijoux', 'vêtements', 'document', 'autre']
const COLORS     = ['noir', 'blanc', 'rouge', 'bleu', 'vert', 'jaune', 'orange', 'rose', 'violet', 'marron', 'gris']

export default function PublishItem() {
  const navigate   = useNavigate()
  const fileRef    = useRef(null)

  const [step, setStep]       = useState(1) // 1 = form, 2 = matches
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const [preview, setPreview] = useState(null)

  const [form, setForm] = useState({
    type: 'LOST',
    title: '',
    description: '',
    category: '',
    color: '',
    keywords: '',
    address: '',
    latitude: '',
    longitude: '',
  })
  const [photo, setPhoto] = useState(null)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée")
      return
    }
    toast.loading("Localisation en cours...", { id: 'geo' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }))
        toast.success("Position récupérée !", { id: 'geo' })
      },
      () => toast.error("Impossible de récupérer votre position", { id: 'geo' })
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category) {
      toast.error('Titre et catégorie sont requis')
      return
    }
    setLoading(true)
    try {
      const keywordsArray = form.keywords
        ? form.keywords.split(',').map(k => k.trim()).filter(Boolean)
        : []

      const itemPayload = {
        type: form.type,
        title: form.title,
        description: form.description,
        category: form.category,
        color: form.color,
        keywords: keywordsArray,
        address: form.address,
        latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      }

      const formData = new FormData()
      formData.append('item', new Blob([JSON.stringify(itemPayload)], { type: 'application/json' }))
      if (photo) formData.append('photo', photo)

      const { data } = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const result = data.data
      const matchList = result.matches ?? []
      setMatches(matchList)
      setStep(2)

      if (matchList.length > 0) {
        toast.success(`🎯 ${matchList.length} correspondance${matchList.length > 1 ? 's' : ''} trouvée${matchList.length > 1 ? 's' : ''} !`)
      } else {
        toast.success('Annonce publiée avec succès !')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la publication')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    if (score >= 60) return 'text-accent-400 bg-accent-500/10 border-accent-500/30'
    if (score >= 40) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }

  const scoreLabel = (score) => {
    if (score >= 80) return 'Très forte'
    if (score >= 60) return 'Forte'
    if (score >= 40) return 'Possible'
    return 'Faible'
  }

  // ─── Step 2: Matches display ────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl mx-auto mb-4">
            {matches.length > 0 ? '🎯' : '✅'}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {matches.length > 0 ? 'Correspondances trouvées !' : 'Annonce publiée !'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {matches.length > 0
              ? `${matches.length} objet${matches.length > 1 ? 's' : ''} potentiellement lié${matches.length > 1 ? 's' : ''} à votre annonce`
              : 'Votre annonce est maintenant visible par tous les utilisateurs'}
          </p>
        </div>

        {matches.length > 0 && (
          <div className="space-y-3 mb-8">
            {matches.map((match, i) => (
              <div key={i} className="card p-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start gap-3">
                  {/* Score */}
                  <div className={`flex-shrink-0 text-center px-3 py-2 rounded-xl border text-sm font-bold ${scoreColor(match.similarityScore)}`}>
                    <div className="text-lg font-black">{match.similarityScore}</div>
                    <div className="text-[10px] font-medium">{scoreLabel(match.similarityScore)}</div>
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {match.matchedItem?.type === 'LOST' ? (
                        <span className="badge-lost">🔍 Perdu</span>
                      ) : (
                        <span className="badge-found">✅ Trouvé</span>
                      )}
                      <span className="text-xs text-gray-500">{match.matchedItem?.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-100 text-sm truncate">{match.matchedItem?.title}</h3>
                    {match.matchedItem?.address && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {match.matchedItem.address}
                      </p>
                    )}
                    {match.matchedKeywords && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {match.matchedKeywords.split(',').map((kw, j) => (
                          <span key={j} className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-[11px] border border-primary-500/20">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact button */}
                  <button
                    onClick={() => navigate(`/chat/${match.matchedItem?.user?.id}`)}
                    className="btn-primary py-1.5 px-3 text-xs flex-shrink-0"
                  >
                    Contacter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="btn-secondary flex-1">
            Voir toutes les annonces
          </button>
          <button onClick={() => { setStep(1); setForm({ type: 'LOST', title: '', description: '', category: '', color: '', keywords: '', address: '', latitude: '', longitude: '' }); setPhoto(null); setPreview(null) }} className="btn-ghost">
            Nouvelle annonce
          </button>
        </div>
      </div>
    )
  }

  // ─── Step 1: Form ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Publier une annonce</h1>
          <p className="text-gray-400 text-sm">Décrivez votre objet pour de meilleures correspondances</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Type selector */}
        <div className="card p-1 flex gap-1">
          {[
            { value: 'LOST',  label: '🔍 J\'ai perdu', desc: 'Vous cherchez un objet' },
            { value: 'FOUND', label: '✅ J\'ai trouvé', desc: 'Vous avez trouvé un objet' },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm(f => ({ ...f, type: value }))}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                form.type === value
                  ? value === 'LOST'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div>{label}</div>
              <div className="text-xs font-normal mt-0.5 opacity-70">{desc}</div>
            </button>
          ))}
        </div>

        {/* Photo upload */}
        <div>
          <label className="label">Photo de l'objet</label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
              preview ? 'border-primary-500/50' : 'border-gray-700 hover:border-primary-500/40'
            }`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Changer la photo</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPhoto(null); setPreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
                <Upload className="w-8 h-8" />
                <p className="text-sm">Glissez une photo ou cliquez pour choisir</p>
                <p className="text-xs text-gray-600">PNG, JPG jusqu'à 10 Mo</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Title */}
        <div>
          <label className="label">Titre de l'annonce *</label>
          <input
            type="text"
            required
            placeholder="ex: Sac à dos noir Nike perdu au marché"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="input"
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            rows={3}
            placeholder="Décrivez l'objet en détail : marque, taille, contenu, circonstances..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input resize-none"
          />
        </div>

        {/* Category & Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Catégorie *</label>
            <select
              required
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input"
            >
              <option value="">Sélectionner...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Couleur</label>
            <select
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className="input"
            >
              <option value="">Sélectionner...</option>
              {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            Mots-clés <span className="text-gray-500 font-normal">(séparés par des virgules)</span>
          </label>
          <input
            type="text"
            placeholder="ex: Nike, sport, fermeture éclair, rouge"
            value={form.keywords}
            onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
            className="input"
          />
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <Target className="w-3 h-3 text-primary-500" />
            Les mots-clés améliorent la précision du matching automatique
          </p>
          {/* Tags preview */}
          {form.keywords && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.keywords.split(',').filter(k => k.trim()).map((k, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs border border-primary-500/20">
                  {k.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Localisation</label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Adresse ou lieu (ex: Marché Capitale, Nouakchott)"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="input"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={form.latitude}
                onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                className="input"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={form.longitude}
                onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                className="input"
              />
              <button
                type="button"
                onClick={getLocation}
                className="btn-secondary px-3 flex-shrink-0"
                title="Utiliser ma position actuelle"
              >
                <MapPin className="w-4 h-4 text-primary-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Publication & recherche de correspondances...
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Publier l'annonce
              <ChevronRight className="w-4 h-4 ml-auto" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
