import Link from "next/link";
import { notFound } from "next/navigation";
import blogData from "@/data/blog.json";
import CommentsSection from "@/components/CommentsSection";
import BoxerLogo from "@/components/BoxerLogo";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  comments: { id: string; name: string; date: string; text: string }[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function categoryColor(cat: string): string {
  switch (cat) {
    case "Planting Tips":    return "bg-green-100 text-green-800";
    case "Recipes":          return "bg-amber-100 text-amber-800";
    case "Pests & Diseases": return "bg-red-100 text-red-800";
    case "Seasonal":         return "bg-blue-100 text-blue-800";
    default:                 return "bg-purple-100 text-purple-800";
  }
}

/** Render content: blank-line-separated paragraphs, **bold** → <strong> */
function renderContent(content: string) {
  const paragraphs = content.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-4 leading-relaxed text-gray-700">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-gray-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}

export function generateStaticParams() {
  return (blogData as BlogPost[]).map((p) => ({ id: p.id }));
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = (blogData as BlogPost[]).find((p) => p.id === params.id);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-garden-green-dark to-garden-green py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="text-garden-green-pale hover:text-white text-sm mb-4 inline-block"
          >
            ← Back to Blog
          </Link>
          <div className="mb-4">
            <BoxerLogo size={70} showButterfly />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor(post.category)}`}
            >
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
            {post.title}
          </h1>
          <p className="text-garden-green-pale text-sm">
            By {post.author} &middot; {formatDate(post.date)}
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Post content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 mb-10">
            <div className="text-base leading-relaxed">
              {renderContent(post.content)}
            </div>
          </div>

          {/* Comments (client component) */}
          <CommentsSection postId={post.id} initialComments={post.comments} />
        </div>
      </section>
    </div>
  );
}
