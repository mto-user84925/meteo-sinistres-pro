import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfGeneratorService = {
  /**
   * Génération du Certificat d'Intempéries (1 Page A4 ultra-nette)
   */
  async generateCertificat1Page(dossierRef = 'Certificat_Intemperies') {
    const rootElement = document.getElementById('pdf-certificat-container');
    if (!rootElement) {
      throw new Error("Conteneur #pdf-certificat-container introuvable");
    }

    const prevDisplay = rootElement.style.display;
    rootElement.style.display = 'block';
    await new Promise(res => setTimeout(res, 100));

    try {
      const pageEl = document.getElementById('pdf-certificat-page') || rootElement.children[0];
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${dossierRef}_Certificat_1Page.pdf`);
      return true;
    } finally {
      rootElement.style.display = prevDisplay;
    }
  },

  /**
   * Génération du Rapport d'Expertise Détaillé (2 Pages A4 avec Carte HD)
   */
  async generateRapport2Pages(dossierRef = 'Rapport_Expertise') {
    const rootElement = document.getElementById('pdf-report-container');
    if (!rootElement) {
      throw new Error("Conteneur #pdf-report-container introuvable");
    }

    // Capture de la carte Leaflet
    const mapElement = document.getElementById('sinistre-map-leaflet-container');
    if (mapElement) {
      try {
        const mapCanvas = await html2canvas(mapElement, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const mapDataUrl = mapCanvas.toDataURL('image/jpeg', 0.95);
        const pdfMapImg = document.getElementById('pdf-map-snapshot-img');
        if (pdfMapImg) {
          pdfMapImg.src = mapDataUrl;
          pdfMapImg.style.display = 'block';
        }
      } catch (e) {
        console.warn('[PDF] Erreur capture carte:', e);
      }
    }

    const prevDisplay = rootElement.style.display;
    rootElement.style.display = 'block';
    await new Promise(res => setTimeout(res, 120));

    try {
      const page1El = document.getElementById('pdf-page-1') || rootElement.children[0];
      const page2El = document.getElementById('pdf-page-2') || rootElement.children[1];

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      if (page1El) {
        const canvas1 = await html2canvas(page1El, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1000
        });
        const img1 = canvas1.toDataURL('image/jpeg', 0.96);
        pdf.addImage(img1, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      if (page2El) {
        pdf.addPage();
        const canvas2 = await html2canvas(page2El, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1000
        });
        const img2 = canvas2.toDataURL('image/jpeg', 0.96);
        pdf.addImage(img2, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${dossierRef}_Rapport_Complet_2Pages.pdf`);
      return true;
    } finally {
      rootElement.style.display = prevDisplay;
    }
  },

  /**
   * Génération du Dossier d'Expertise 3 Pages A4 (Certificat FXI3S, Tableau 24h, Graphismes HD)
   */
  async generateDossier3Pages(dossierRef = 'Certificat_Dossier_3Pages') {
    const rootElement = document.getElementById('pdf-dossier-3pages-container');
    if (!rootElement) {
      throw new Error("Conteneur #pdf-dossier-3pages-container introuvable");
    }

    const prevDisplay = rootElement.style.display;
    rootElement.style.display = 'block';
    await new Promise(res => setTimeout(res, 120));

    try {
      const page1El = document.getElementById('pdf-dossier-page-1');
      const page2El = document.getElementById('pdf-dossier-page-2');
      const page3El = document.getElementById('pdf-dossier-page-3');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const captureOptions = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      };

      if (page1El) {
        const canvas1 = await html2canvas(page1El, captureOptions);
        const img1 = canvas1.toDataURL('image/jpeg', 0.96);
        pdf.addImage(img1, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      if (page2El) {
        pdf.addPage();
        const canvas2 = await html2canvas(page2El, captureOptions);
        const img2 = canvas2.toDataURL('image/jpeg', 0.96);
        pdf.addImage(img2, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      if (page3El) {
        pdf.addPage();
        const canvas3 = await html2canvas(page3El, captureOptions);
        const img3 = canvas3.toDataURL('image/jpeg', 0.96);
        pdf.addImage(img3, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${dossierRef}_Dossier_3Pages.pdf`);
      return true;
    } finally {
      rootElement.style.display = prevDisplay;
    }
  },

  /**
   * Génération de l'Attestation d'Intempéries BTP (1 Page A4 Officielle CIBTP)
   */
  async generateAttestationBtp(dossierRef = 'Attestation_Intemperies_BTP') {
    const rootElement = document.getElementById('pdf-attestation-btp-container');
    if (!rootElement) {
      throw new Error("Conteneur #pdf-attestation-btp-container introuvable");
    }

    const prevDisplay = rootElement.style.display;
    rootElement.style.display = 'block';
    await new Promise(res => setTimeout(res, 120));

    try {
      const pageEl = document.getElementById('pdf-attestation-btp-page') || rootElement.children[0];
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${dossierRef}.pdf`);
      return true;
    } finally {
      rootElement.style.display = prevDisplay;
    }
  }
};
