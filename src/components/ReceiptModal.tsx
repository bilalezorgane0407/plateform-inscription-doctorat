import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Calendar 
} from 'lucide-react';
import { Application } from '../types';

interface ReceiptModalProps {
  application: Application | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  application,
  onClose,
}) => {
  if (!application) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Actions bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-slate-300">
            Aperçu officiel de l'accusé de réception
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le récépissé</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer le récépissé"
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-receipt">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">
                Royaume du Maroc
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-blue-950 uppercase tracking-tight">
                Université Sidi Mohamed Ben Abdellah de Fès
              </h2>
              <span className="text-xs text-slate-600 block mt-0.5">
                Pôle des Études Doctorales · CEDoc Sciences, Technologies & SHS
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                Accusé Numérique Certifié
              </span>
              <p className="text-xs font-mono font-bold text-blue-950 mt-1 tabular-nums">
                {application.numeroDossier}
              </p>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
              Récépissé Officiel de Dépôt de Candidature au Doctorat
            </h3>
            <span className="text-xs text-slate-600">
              Campagne Universitaire 2026-2027 · Session Automne
            </span>
          </div>

          {/* Candidate Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 block">Nom et Prénom du Candidat</span>
                <span className="font-bold text-slate-900 text-sm">{application.candidat.nom} {application.candidat.prenom}</span>
              </div>
              <div>
                <span className="text-slate-500 block">N° Carte Nationale (CIN) / Passeport</span>
                <span className="font-semibold text-slate-900 font-mono">{application.candidat.cin}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Code National Étudiant (CNE / MASSAR)</span>
                <span className="font-semibold text-slate-900 font-mono">{application.candidat.cneMassar}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 block">Parcours académique déclaré</span>
                <span className="font-semibold text-slate-900">
                  {application.candidat.parcours === 'ingenieur' ? 'Diplôme d’Ingénieur d’État' : application.candidat.parcours === 'lmd_master' ? 'Master LMD' : 'Diplôme étranger avec équivalence'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Date et horodatage de soumission</span>
                <span className="font-semibold text-slate-900 font-mono">{application.dateSoumission || application.dateCreation}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Situation professionnelle</span>
                <span className="font-semibold text-slate-900">{application.candidat.estSalarie ? `Salarié (${application.candidat.employeur})` : 'Non salarié (Disponible)'}</span>
              </div>
            </div>
          </div>

          {/* Selected Topics List */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Sujets de recherche retenus ({application.sujetsChoisis.length} choix déclarés sans hiérarchie) :
            </span>
            <div className="space-y-2 text-xs">
              {application.sujetsChoisis.map((topic, i) => (
                <div key={topic.id} className="p-2.5 border border-slate-200 rounded-md bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-900">{topic.code}</span>
                    <span className="text-slate-500 text-[11px]">{topic.etablissement}</span>
                  </div>
                  <p className="font-semibold text-slate-900 mt-0.5">{topic.titre}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Labo : {topic.laboratoire} · Directeur : {topic.encadrant.nom}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code and Verification Seal */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center p-1">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-slate-500 block">
                  Signature cryptographique USMBA
                </span>
                <span className="font-mono text-[10px] text-slate-700 block">
                  SHA-256 : {application.numeroDossier.replace(/-/g, '')}8F39C2
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Vérifiable via le portail scolarité USMBA
                </span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Cachet de la Présidence de l'USMBA
              </span>
              <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded font-bold text-[11px]">
                Dossier Enregistré
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
