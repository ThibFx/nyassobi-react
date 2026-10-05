import { useSettings } from "@/lib/content";
import { Band } from "@/ui/Band";
import { Meta } from "@/ui/Meta";
import { PageHero } from "@/ui/PageHero";

/** Texte repris tel quel de l'ancien site. */
export default function LegalPage() {
  const { contactEmail } = useSettings();
  return (
    <>
      <Meta title="Mentions légales" />
      <PageHero
        kicker="Informations"
        title="Mentions légales"
        description="Merci de lire attentivement les présentes modalités d'utilisation du présent site avant de le parcourir. En vous connectant sur ce site, vous acceptez sans réserve les présentes modalités."
        pose="actually"
      />
      <Band tone="creme" narrow className="pt-2">
        <div className="prose-wp">
          <h2>Éditeur du site / Responsable éditorial</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            <p>
              <strong>Startingames</strong>
              <br />
              9 rue du Bois, Sauvry-Haut
              <br />
              58270 Saint-Benin d'Azy – France
              <br />
              Mail : contact@studio-startingames.com
              <br />
              Site :{" "}
              <a href="http://www.studio-startingames.com" target="_blank" rel="noopener noreferrer">
                www.studio-startingames.com
              </a>
              <br />
              Association loi 1901, RNA : W583004763
            </p>
            <p>
              <strong>Nyassobi</strong>
              <br />
              55, rue Joseph Hue
              <br />
              76250 Déville-lès-Rouen – France
              <br />
              Mail : {contactEmail}
              <br />
              Site :{" "}
              <a href="https://www.nyassobi.fr" target="_blank" rel="noopener noreferrer">
                www.nyassobi.fr
              </a>
              <br />
              Association loi 1901, RNA : W763021178
            </p>
          </div>
          <h2>Hébergement</h2>
          <p>
            <strong>OVH</strong>
            <br />
            2 rue Kellermann, 59100 Roubaix – France
            <br />
            Site :{" "}
            <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer">
              www.ovh.com
            </a>
          </p>
          <h2>Conditions d'utilisation</h2>
          <p>
            L'utilisation de ce site est régie par les présentes conditions. En utilisant le site, vous reconnaissez avoir pris connaissance de ces conditions et les avoir
            acceptées. Celles-ci peuvent être modifiées à tout moment et sans préavis. Startingames ne saurait être tenue pour responsable en aucune manière d'une mauvaise
            utilisation du service.
          </p>
          <h2>Limites de responsabilité</h2>
          <p>
            L'ensemble des services proposés sont aussi précis et fonctionnels que possible et sont mis à jour dès que nécessaire. Toutefois, certains éléments peuvent être
            inexacts ou non fonctionnels. Si vous constatez cela, vous avez la possibilité de nous contacter via le formulaire de contact, rubrique « Réclamations WEB », ou par
            mail en précisant autant que faire se peut le maximum d'informations (pages, services, navigateur, OS…). Ces informations nous permettent de cibler plus rapidement
            le problème afin d'apporter un correctif dans les meilleurs délais.
          </p>
          <p>
            Tout contenu téléchargé se fait sous la responsabilité de l'utilisateur. Nous faisons notre maximum afin de sécuriser notre site et nos services. De plus nous
            testons l'ensemble de nos services sur plusieurs plateformes avant leur mise à disposition. Startingames ne saurait être tenu responsable de quelconque dommage
            consécutif à l'utilisation de nos services.
          </p>
          <p>L'ensemble des images sont non contractuelles.</p>
          <p>
            Les liens sont analysés avant publication. Cependant, nous ne pouvons pas les vérifier continuellement. Si vous constatez un lien cassé ou inapproprié, merci de
            nous le signaler.
          </p>
          <h2>Propriété intellectuelle</h2>
          <p>
            Sauf mentions contraires, l'ensemble du site et des services proposés sont la propriété de Nyassobi. Toute reproduction, distribution, modification, adaptation,
            retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans autorisation de la part de Nyassobi. Le non-respect de
            cette interdiction constitue une contrefaçon pouvant engager la responsabilité civile et pénale du contrefacteur. En outre, les propriétaires des contenus copiés
            pourraient intenter une action en justice à votre encontre.
          </p>
          <p>Toute mention doit faire l'objet d'un lien vers notre source originelle. Pour toute demande d'autorisation, veuillez nous contacter.</p>
          <h2>Informations personnelles</h2>
          <p>
            Nos services, de par leur fonctionnement intrinsèque, peuvent utiliser certaines informations personnelles (adresse IP, lien cliqué, informations communiquées).
            Sauf mentions contraires, l'ensemble de ces données sont utilisées uniquement afin de vous fournir une meilleure expérience utilisateur et ne sont en aucun cas
            sauvegardées.
          </p>
        </div>
      </Band>
    </>
  );
}
