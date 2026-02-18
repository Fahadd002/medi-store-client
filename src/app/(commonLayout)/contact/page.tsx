// app/contact/page.tsx
import { MapPin, Phone, Mail, Clock, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import Link from 'next/link'

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-emerald-700 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-emerald-100">Get in touch with our team</p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Contact Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Address</p>
                  <p className="text-gray-600">123 Medical Street, Health City, HC 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Phone</p>
                  <p className="text-gray-600">+1 234 567 890</p>
                  <p className="text-gray-600">+1 234 567 891</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-gray-600">support@medistore.com</p>
                  <p className="text-gray-600">info@medistore.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Business Hours</p>
                  <p className="text-gray-600">Monday - Friday: 9am - 8pm</p>
                  <p className="text-gray-600">Saturday - Sunday: 10am - 6pm</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <p className="font-medium text-gray-800 mb-3">Follow Us</p>
              <div className="flex gap-3">
                <Link href="#" className="p-2 bg-gray-200 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="p-2 bg-gray-200 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="p-2 bg-gray-200 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="p-2 bg-gray-200 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Send Message</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="What is this about?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Your message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Simple Map Placeholder */}
        <div className="mt-8">
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-500">
            <MapPin className="h-8 w-8 mr-2" />
            <span>Map Location</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact