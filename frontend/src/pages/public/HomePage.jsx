import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI, categoriesAPI } from '../../services/api';
import FeaturedHeroCard from '../../components/common/FeaturedHeroCard';
import ArticleCard from '../../components/common/ArticleCard';
import NewsletterBox from '../../components/common/NewsletterBox';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEOHead from '../../components/common/SEOHead';
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Code2,
  Cpu,
  Smartphone,
  ShieldCheck,
  Cloud,
  Folder
} from 'lucide-react';

const iconMap = {
  Code2,
  Cpu,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Cloud,
  TrendingUp,
  Folder
};

const HomePage = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, latestRes, trendRes, catRes] = await Promise.all([
          articlesAPI.getFeatured(),
          articlesAPI.getAll({ limit: 6, sort: '-publishedAt' }),
          articlesAPI.getTrending(),
          categoriesAPI.getAll()
        ]);

        if (featRes.data.success) setFeaturedArticles(featRes.data.data);
        if (latestRes.data.success) setLatestArticles(latestRes.data.data);
        if (trendRes.data.success) setTrendingArticles(trendRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error('Failed to load homepage content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Assembling editorial dispatch..." />;
  }

  const primaryLead = featuredArticles[0] || latestArticles[0];

  return (
    <div className="animate-fade-in">
      <SEOHead
        title="Engineering Publications & Technology Journal"
        description="An independent technical journal investigating autonomous intelligence, distributed systems, cloud platforms, and software craftsmanship."
        canonicalUrl={typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://techblog.internal/'}
      />
      {/* 1. ASYMMETRIC NATURE-TECH HERO SECTION */}
      <section className="hero-editorial-section">
        <div className="container">
          <div className="hero-grid">
            {/* Primary Featured Investigation Card */}
            <div>
              {primaryLead && <FeaturedHeroCard article={primaryLead} />}
            </div>

            {/* Trending Articles Sidebar */}
            <div>
              <div className="hero-trending-panel">
                <div className="trending-header">
                  <TrendingUp size={22} color="var(--color-peach)" />
                  <h3>Trending Inquiries</h3>
                </div>

                <div className="trending-list">
                  {trendingArticles.slice(0, 4).map((art, index) => (
                    <div key={art._id} className="trending-item">
                      <span className="trending-num">0{index + 1}</span>
                      <div>
                        <h4 className="trending-title">
                          <Link to={`/blog/${art.slug}`}>{art.title}</Link>
                        </h4>
                        <div className="trending-meta">
                          <span>{art.category?.name}</span>
                          <span>•</span>
                          <span>{art.readTimeMinutes || 5} min read</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link
                    to="/blog"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--color-peach)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600
                    }}
                  >
                    <span>View all published dispatches</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY HORIZONS EXPLORATION */}
      <section style={{ padding: 'var(--space-12) 0', backgroundColor: 'rgba(7, 63, 50, 0.03)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <div>
              <div className="kicker">Core Topics</div>
              <h2 style={{ fontSize: '2.2rem' }}>Explore Editorial Desks</h2>
            </div>
            <Link to="/blog" className="btn btn-outline btn-sm">
              All Desks <ArrowRight size={14} />
            </Link>
          </div>

          <div className="category-tiles-grid">
            {categories.map((cat) => {
              const IconComponent = iconMap[cat.icon] || Folder;
              return (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="category-tile"
                >
                  <div
                    className="category-icon-box"
                    style={{ backgroundColor: cat.color || 'var(--color-forest)' }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div className="category-tile-info">
                    <h4>{cat.name}</h4>
                    <span className="category-tile-count">
                      {cat.articleCount} {cat.articleCount === 1 ? 'Dispatch' : 'Dispatches'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. LATEST DISPATCHES ARTICLE GRID */}
      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-10)' }}>
            <div>
              <div className="kicker">Fresh Off The Press</div>
              <h2 style={{ fontSize: '2.4rem' }}>Latest Technical Dispatches</h2>
            </div>
            <Link to="/blog" className="btn btn-primary">
              Browse Complete Archive <ArrowRight size={16} />
            </Link>
          </div>

          <div className="editorial-grid-asymmetric">
            {latestArticles.map((article, index) => {
              // Lead dispatch in latest grid renders as an expansive horizontal editorial card
              if (index === 0) {
                return (
                  <div key={article._id} className="editorial-col-full">
                    <ArticleCard article={article} variant="horizontal" />
                  </div>
                );
              }
              return (
                <div key={article._id} className="editorial-col-half">
                  <ArticleCard article={article} variant="standard" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER BANNER */}
      <div className="container">
        <NewsletterBox />
      </div>
    </div>
  );
};

export default HomePage;

