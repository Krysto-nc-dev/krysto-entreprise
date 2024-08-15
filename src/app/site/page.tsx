import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { pricingCards } from '@/lib/constants'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
export default function Home() {
  return (
    <>
      <section className="h-full w-full pt-[900px] xs:pt-10 mt-10 relative flex items-center justify-center flex-col">
        <p className="text-center">Gestion de business tout en un</p>
        <div className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text relative">
          <h1 className="text-7xl font-bold text-center md:text-[200px] leading-none">
            KRYSTO
          </h1>
        </div>
        <div className="flex justify-center relative items-center">
          <Image
            src="/assets/preview2.png"
            alt="banner image"
            width={1000}
            height={1000}
            className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
        <section className="flex justify-center items-center flex-col gap-4 mt-6">
          <h2 className="text-3xl text-center p-2">
            Choisissez ce qui vous convient le mieux
          </h2>
          <p className="text-muted-foreground text-center">
            Nos plans de tarification simples sont adaptés à vos besoins. Si vous
            n'êtes pas prêt à vous engager, vous pouvez commencer gratuitement.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mt-6">
            {pricingCards.map((card) => (
              <Card
                key={card.title}
                className={`w-[300px] flex flex-col justify-between ${card.title === 'Pro' ? 'border-2 border-primary' : ''}`}
              >
                <CardHeader>
                  <CardTitle className={`${card.title !== 'Pro' ? 'text-muted-foreground' : ''}`}>
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between gap-4">
                  <span className="text-xl font-bold">{card.price}</span>
                  {card.title === "Sur-mesure" ? (
                    <p className="text-muted-foreground text-sm">
                      Disponible à la demande
                    </p>
                  ) : (
                    <p className="text-muted-foreground font-bold text-xs">/Mois</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4">
                  <div>
                    {card.features.map((feature) => (
                      <div key={feature} className="flex gap-2 items-center">
                        <Check className="text-muted-foreground" />
                        <p>{feature}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={card.title === "Sur-mesure" ? `/organisation?plan=${card.priceId}` : `/organisation?plan=${card.priceId}`}
                    className={`w-full text-center bg-primary p-2 rounded-md font-bold text-gray-700 ${
                      card.title !== 'Pro' ? '!bg-secondary' : ''
                    } ${card.title !== 'Sur-mesure' ? '!bg-muted-secondary' : ''}`}
                  >
                    {card.title === "Sur-mesure" ? "Nous contacter" : "Commencer"}
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </>
  )
}
