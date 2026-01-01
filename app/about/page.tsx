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
  Our Team
</h1>

{/* TEAM MEMBERS */}
<div className="space-y-16">

  {/* Yashwant Sah */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
    <div className="relative p-5 rounded-tl-[40%] rounded-tr-[60%] rounded-br-[35%] rounded-bl-[55%] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
      <Image
        src="/yaswant.jpg"
        alt="Yashwant Sah - Product Manager"
        width={240}
        height={240}
        className="object-cover w-40 h-40 sm:w-60 sm:h-60 rounded-lg shadow-lg"
      />
    </div>

    <div className="text-center sm:text-left max-w-md">
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
        Yashwant Sah
      </h2>
      <p className="text-lg text-muted-foreground mb-4">
        Product Manager
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Leading product strategy and ensuring exceptional user experience across all Mithila Bazar platforms.
      </p>
    </div>
  </div>

  {/* Siddhant Dahal */}
  <div className="flex flex-col sm:flex-row-reverse items-center sm:items-start gap-8">
    <div className="relative p-5 rounded-tl-[40%] rounded-tr-[60%] rounded-br-[35%] rounded-bl-[55%] overflow-hidden bg-gradient-to-br from-green-100 to-blue-100">
      <Image
        src="/Siddhant.jpg"
        alt="Siddhant Dahal - Technical Lead"
        width={240}
        height={240}
        className="object-cover w-40 h-40 sm:w-60 sm:h-60 rounded-lg shadow-lg"
      />
    </div>

    <div className="text-center sm:text-right max-w-md">
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
        Siddhant Dahal
      </h2>
      <p className="text-lg text-muted-foreground mb-4">
        Technical Lead
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Architecting robust technical solutions and leading the development team to build scalable e-commerce platforms.
      </p>
    </div>
  </div>

  {/* Himanshu Yadav */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
    <div className="relative p-5 rounded-tl-[40%] rounded-tr-[60%] rounded-br-[35%] rounded-bl-[55%] overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
      <Image
        src="/himanshu.jpg"
        alt="Himanshu Yadav - Product Distributor"
        width={240}
        height={240}
        className="object-cover w-40 h-40 sm:w-60 sm:h-60 rounded-lg shadow-lg"
      />
    </div>

    <div className="text-center sm:text-left max-w-md">
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
        Himanshu Yadav
      </h2>
      <p className="text-lg text-muted-foreground mb-4">
        Product Distributor
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Managing product sourcing, logistics, and ensuring seamless delivery of quality products to our customers.
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
