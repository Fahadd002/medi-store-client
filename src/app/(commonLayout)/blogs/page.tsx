// app/blogs/page.tsx
import { Calendar, User, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const Blogs = () => {
  const blogs = [
    {
      id: 1,
      title: "10 Tips for Boosting Your Immune System Naturally",
      excerpt: "Discover natural ways to strengthen your immune system and stay healthy throughout the year.",
      author: "Dr. Sarah Johnson",
      date: "Feb 15, 2026",
      readTime: "5 min read",
      category: "Health Tips",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format"
    },
    {
      id: 2,
      title: "Understanding Common Cold vs. Flu",
      excerpt: "Learn the differences between cold and flu symptoms, and when to see a doctor.",
      author: "Dr. Michael Chen",
      date: "Feb 10, 2026",
      readTime: "4 min read",
      category: "Wellness",
      image: "https://images.unsplash.com/photo-1666214280391-d4c1c6c6c8c8?w=500&auto=format"
    },
    {
      id: 3,
      title: "The Importance of Vitamin D in Winter",
      excerpt: "Why vitamin D is crucial during winter months and how to maintain healthy levels.",
      author: "Dr. Emily Williams",
      date: "Feb 5, 2026",
      readTime: "3 min read",
      category: "Nutrition",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format"
    },
    {
      id: 4,
      title: "Managing Stress for Better Heart Health",
      excerpt: "Simple techniques to reduce stress and improve your cardiovascular health.",
      author: "Dr. James Brown",
      date: "Jan 28, 2026",
      readTime: "6 min read",
      category: "Heart Health",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format"
    },
    {
      id: 5,
      title: "Natural Remedies for Better Sleep",
      excerpt: "Effective natural solutions to improve your sleep quality and wake up refreshed.",
      author: "Dr. Lisa Anderson",
      date: "Jan 20, 2026",
      readTime: "4 min read",
      category: "Sleep Health",
      image: "https://images.unsplash.com/photo-1541199249251-f713e6145474?w=500&auto=format"
    },
    {
      id: 6,
      title: "Essential Vitamins for Women's Health",
      excerpt: "A comprehensive guide to vitamins and minerals essential for women at every age.",
      author: "Dr. Maria Garcia",
      date: "Jan 12, 2026",
      readTime: "5 min read",
      category: "Women's Health",
      image: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=500&auto=format"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Health Blog</h1>
          <p className="text-emerald-100 max-w-2xl">
            Expert advice, health tips, and wellness insights from our medical professionals
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-emerald-100"
            >
              {/* Image */}
              <div className="h-48 overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Category */}
                <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded mb-3">
                  {blog.category}
                </span>

                {/* Title */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors">
                  {blog.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {blog.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <Link 
                  href={`/blogs/${blog.id}`}
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 bg-emerald-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Stay Updated with Health Tips
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Subscribe to our newsletter and get the latest health articles directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blogs