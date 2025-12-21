import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useWordPressPosts } from "../hooks/useWordPressContent";
import Loader from "../components/Loader";

import styles2 from "./HomePage.module.scss";
import styles from "./BlogIndex.module.scss";
import TitleNyasso from "../TitleNyasso";
import Footer from "../Footer";

const ensureLeadingSlash = (value) => {
  if (!value) {
    return "/";
  }

  return value.startsWith("/") ? value : `/${value}`;
};

const stripHtml = (value) => {
  if (!value) {
    return "";
  }

  return value.replace(/<[^>]+>/g, "").trim();
};

const PAGE_SIZE = 5;

function BlogIndex() {
  const { items: posts, loading, error } = useWordPressPosts({ first: 20 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const allCategories = useMemo(() => {
    const map = new Map();

    posts.forEach((post) => {
      (post.categories ?? []).forEach((category) => {
        if (category.slug && !map.has(category.slug)) {
          map.set(category.slug, {
            slug: category.slug,
            name: category.name || category.slug,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "fr-FR"));
  }, [posts]);

  /* multi filtres
  const toggleCategory = useCallback((slug) => {
    setSelectedCategories((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      return [...current, slug];
    });
    setCurrentPage(1);
  }, []);
  */

  // uniquement un filtre
  const toggleCategory = useCallback((slug) => {
  setSelectedCategories((current) => {
    if (current.includes(slug)) {
      return [];
    }
    return [slug];
  });
  setCurrentPage(1);
}, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCategories([]);
    setCurrentPage(1);
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) {
      return posts;
    }

    return posts.filter((post) =>
      selectedCategories.every((slug) => post.categories.some((category) => category.slug === slug)),
    );
  }, [posts, selectedCategories]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [posts.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, currentPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [totalPages, currentPage],
  );

  if (loading) {
    return <Loader label="Chargement des articles..." />;
  }

  if (error) {
    const routedError = Object.assign(
      new Error("Impossible de récupérer les articles."),
      {
        status: 500,
        statusText: "Erreur de chargement des articles",
      },
    );

    throw routedError;
  }

  if (!posts.length) {
    const routedError = Object.assign(new Error("Aucun article trouvé."), {
      status: 404,
      statusText: "Aucun article pour le moment",
    });

    throw routedError;
  }

  return (<>
    <div className={styles2['mainContent']}>
      <div className={styles2['mainContent']}>
        <div className={styles2['homePage']}>
          <section>
            <TitleNyasso title="News" subtitle="Les dernières actualités" />

            {allCategories.length > 0 ? (
              <div className={styles.filters}>
                {allCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.slug);
                  const isDimmed = selectedCategories.length > 0 && !isSelected;

                  const buttonClasses = [
                    styles.filterButton,
                    isSelected ? styles.filterButtonSelected : "",
                    isDimmed ? styles.filterButtonDimmed : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => toggleCategory(category.slug)}
                      className={buttonClasses}
                    >
                      {category.name}
                    </button>
                  );
                })}
                {selectedCategories.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className={`${styles.filterButton} ${styles.filterButtonReset}`}
                  >
                    Réinitialiser
                  </button>
                ) : null}
              </div>
            ) : null}

            {filteredPosts.length === 0 ? (
              <p>Aucun article ne correspond à ces catégories pour le moment.</p>
            ) : (
              <>
                <ul className={styles.postList}>
                  {paginatedPosts.map((post, index) => {
                    const targetUri = ensureLeadingSlash(post.uri);
                    const publicationDate = post.date
                      ? new Date(post.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : null;
                    const isLastItem = index === paginatedPosts.length - 1;
                    const imageSrc = post.featuredImage?.sourceUrl || null;
                    const imageAlt = post.featuredImage?.altText || stripHtml(post.title);

                    return (
                      <li key={post.id} className={styles.postItem}>
                        <div>
                          <h2>
                            <Link to={targetUri} style={{textDecoration: "none"}}>
                              <TitleNyasso subtitle={ post?.title }/>
                            </Link>
                          </h2>
                          <div className={styles.metaRow}>
                            {publicationDate ? (
                              <p style={{ fontStyle: "italic", margin: 0 }}>Le {publicationDate}</p>
                            ) : null}
                            {post.categories.length > 0 ? (
                              <div className={styles.tagList}>
                                {post.categories.map((category) => (
                                  <span key={`${post.id}-${category.slug}`} className={styles.tag}>
                                    {category.name}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {imageSrc ? (
                          <Link to={targetUri} className={styles.postImageLink}>
                            <div className={styles.postImageWrapper}>
                              <img src={imageSrc} alt={imageAlt} className={styles.postImage} loading="lazy" />
                            </div>
                          </Link>
                        ) : null}
                        {post.excerpt && (
                          <div
                            className={styles.postExcerpt}
                            dangerouslySetInnerHTML={{ __html: post.excerpt }}
                          />
                        )}
                        <Link to={targetUri} className={styles.readMore}>
                          Lire la suite →
                        </Link>
                        {!isLastItem ? <div className={styles.divider} aria-hidden="true" /> : null}
                      </li>
                    );
                  })}
                </ul>

                {totalPages > 1 ? (
                  <div className={styles.pagination}>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`${styles.paginationButton} ${currentPage === 1 ? styles.paginationButtonDisabled : ""}`.trim()}
                    >
                      Précédent
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      const isActive = pageNumber === currentPage;

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => handlePageChange(pageNumber)}
                          className={`${styles.paginationButton} ${isActive ? styles.paginationButtonActive : ""}`.trim()}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`${styles.paginationButton} ${currentPage === totalPages ? styles.paginationButtonDisabled : ""}`.trim()}
                    >
                      Suivant
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
    <Footer/>
  
  </>);
}

export default BlogIndex;
