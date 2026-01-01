import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MessageCircle, Clock } from "lucide-react"

export default function CustomerServicePage() {
  return (
    <main>
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-serif text-5xl font-bold text-foreground">Customer Service</h1>
          <p className="mt-4 text-lg text-muted-foreground">We're here to help with any questions or concerns</p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">mithilabazar@gmail.com</p>
                <p className="mt-2 text-sm text-muted-foreground">We typically respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">9821147792, 9822359993, 9769351454, 9764796146</p>
                <p className="mt-2 text-sm text-muted-foreground">Mon-Fri: 9AM - 6PM NPT</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Current Not Available on The Website</p>
                <p className="mt-2 text-sm text-muted-foreground">You can still reach out via Whatsapp DM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Sunday - Friday: 9AM - 6PM</p>
                <p className="text-muted-foreground">Saturday: 10AM - 4PM</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
