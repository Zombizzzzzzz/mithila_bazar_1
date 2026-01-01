import Image from "next/image"

export default function AboutPage() {
  return (
    <main>
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-5xl font-bold text-foreground">About Mithila Bazar</h1>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Welcome to Mithila Bazar, your premier destination for curated premium products across electronics,
              artisan crafts, luxury timepieces, and fashion-forward clothing.
            </p>
            <p>
              We believe in the power of quality and craftsmanship. Each product in our collection is carefully selected
              to meet our high standards of excellence, ensuring that every purchase is an investment in lasting value.
            </p>
            <p>
              Our mission is to bridge traditional craftsmanship with modern innovation, offering you a shopping
              experience that celebrates both heritage and progress.
            </p>
         <h1 className="font-serif text-5xl font-bold text-foreground text-center sm:text-left mb-12">
  Our Crew
</h1>

{/* CREW MEMBER */}
<div className="space-y-16">

  {/* Founder 1 */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
    <div className="p-5 rounded-tl-[40%] rounded-tr-[60%] rounded-br-[35%] rounded-bl-[55%] overflow-hidden">
      <Image
        src="/profile.jpg"
        alt="Mithila Bazar Crew"
        width={240}
        height={240}
        className="object-cover w-40 h-40 sm:w-60 sm:h-60"
      />
    </div>

    <div className="text-center sm:text-left max-w-md">
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
        Founder
      </h2>
      <p>
        Currently Operating As Product Manager,{" "}
        <u><b>Yashwant Jha</b></u>
      </p>
    </div>
  </div>

  {/* Founder 2 */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
    <div className="p-5 rounded-tl-[40%] rounded-tr-[60%] rounded-br-[35%] rounded-bl-[55%] overflow-hidden">
      <Image
        src="/profile.jpg"
        alt="Mithila Bazar Crew"
        width={240}
        height={240}
        className="object-cover w-40 h-40 sm:w-60 sm:h-60"
      />
    </div>

    <div className="text-center sm:text-left max-w-md">
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
        Founder
      </h2>
      <p>
        Our product distributor,{" "}
        <u><b>Himanshu</b></u>
      </p>
    </div>
  </div>

  {/* Co-Founder */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
    <div className="p-5 rounded-tl-[40%] rounded-tr-[60%] rounded-br-[35%] rounded-bl-[55%] overflow-hidden">
      <Image
        src="/profile.jpg"
        alt="Mithila Bazar Crew"
        width={240}
        height={240}
        className="object-cover w-40 h-40 sm:w-60 sm:h-60"
      />
    </div>

    <div className="text-center sm:text-left max-w-md">
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
        Co-Founder
      </h2>
      <p>
        Technical Lead for Mithila Bazar,{" "}
        <u><b>Siddhant Dahal</b></u>
      </p>
    </div>
  </div>

</div>

          </div>
        </div>
      </section>
    </main>
  )
}
