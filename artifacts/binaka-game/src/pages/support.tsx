import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone } from "lucide-react";

export default function Support() {
  return (
    <div className="p-4 space-y-6 pb-20 w-full bg-slate-50 min-h-[100dvh]">
      <header>
        <h1 className="text-2xl font-bold">Support Client</h1>
        <p className="text-sm text-muted-foreground mt-1">Nous sommes là pour vous aider 24/7</p>
      </header>

      <div className="grid gap-3">
        <a href="https://t.me/binakagame" target="_blank" rel="noreferrer">
          <Button className="w-full h-14 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold flex justify-start px-6">
            <Send className="w-5 h-5 mr-3" />
            Nous contacter sur Telegram
          </Button>
        </a>
        <a href="https://wa.me/binakagame" target="_blank" rel="noreferrer">
          <Button className="w-full h-14 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold flex justify-start px-6">
            <Phone className="w-5 h-5 mr-3" />
            Nous contacter sur WhatsApp
          </Button>
        </a>
        <Button className="w-full h-14 font-bold flex justify-start px-6" variant="outline">
          <MessageCircle className="w-5 h-5 mr-3" />
          Chat en direct (Bientôt)
        </Button>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <h2 className="font-bold text-lg mb-4">Questions Fréquentes</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-semibold">Comment faire un dépôt ?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Allez dans la section Portefeuille, cliquez sur Dépôt, choisissez votre moyen de paiement (TMoney, Flooz, etc.), entrez le montant et suivez les instructions sur votre téléphone.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm font-semibold">Combien de temps prend un retrait ?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Les retraits sont traités automatiquement et prennent généralement moins de 15 minutes. En cas de réseau chargé, cela peut prendre jusqu'à 24h.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm font-semibold">Le jeu est-il équitable ?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Oui, tous nos jeux utilisent un générateur de nombres aléatoires (RNG) certifié pour garantir des résultats 100% impartiaux.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-sm font-semibold">J'ai oublié mon mot de passe</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Contactez notre support client via Telegram ou WhatsApp avec le numéro de téléphone associé à votre compte.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
