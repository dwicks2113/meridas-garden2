import Link from "next/link";
import blogData from "@/data/blog.json";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function BlogPage() {
  const posts = blogData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <section className="bg-gradient-to-br from-garden-sky to-garden-sky/80 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">Garden Blog</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Tips, seasonal guides, and stories from the garden in Clearwater, FL.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-garden-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* How to add posts */}
          <div className="bg-garden-sky-pale rounded-xl p-5 mb-8">
            <p className="text-sm text-gray-700">
              <strong>Adding blog posts:</strong> Edit{" "}
              <code className="bg-white/60 px-2 py-0.5 rounded text-xs">src/data/blog.json</code> to
              add new posts with title, content paragraphs, tags, and comments.
            </p>
          </div>

          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="card p-6 md:p-8">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span>{formatDate(post.date)}</span>
                  <span>&middot;</span>
                  <span>By {post.author}</span>
                  {post.comments.length > 0 && (
                    <>
                      <span>&middot;</span>
                      <span>{post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}</span>
                    </>
                  )}
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl md:text-2xl font-heading font-bold text-garden-green-dark hover:text-garden-green transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-garden-green-pale text-garden-green-dark px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/blog/${post.slug}`}
                    className="text-garden-green hover:text-garden-green-dark text-sm font-medium">
                    Read more &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
