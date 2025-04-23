const { useState, useEffect, useRef } = React;

// Utility to retry image loading
const loadImageWithRetry = (url, retries = 5, delay = 1500) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      if (img.naturalWidth < 100 || img.naturalHeight < 100) {
        console.warn(`Image quality too low: ${url}, dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
      }
      resolve(url);
    };
    img.onerror = (e) => {
      console.error(`Image load failed: ${url}, error: ${e.type}`);
      if (retries > 0) {
        console.log(`Retrying image load: ${url}, retries left: ${retries}`);
        setTimeout(() => {
          loadImageWithRetry(url, retries - 1, delay).then(resolve).catch(reject);
        }, delay);
      } else {
        console.error(`Failed to load image after retries: ${url}`);
        reject(new Error(`Failed to load image: ${url}`));
      }
    };
  });
};

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalProject, setModalProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStatuses, setImageStatuses] = useState({});
  const [pageLoaded, setPageLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchStartY.current = e.changedTouches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    touchEndY.current = e.changedTouches[0].clientY;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      const diffY = touchStartY.current - touchEndY.current;
      const angle = Math.abs(Math.atan2(diffY, diffX) * (180 / Math.PI));

      if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50) {
        if (diffX > 0) {
          nextImage();
        } else {
          prevImage();
        }
      } else if (Math.abs(diffY) > 50 && diffY < 0 && angle > 75 && angle < 105) {
        closeModal();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  const loadingMessages = [
    "Fetching creativity, please wait...",
    "Designing brilliance, hold tight!",
    "Loading pixels of perfection...",
    "Have you smiled today? 😊",
    "What's your favorite color?",
    "Dreaming up designs for you...",
    "Ever wondered how UI meets UX?",
    "Loading... What's your next big idea?",
  ];

  const loadingEmojis = ["🐱", "🐶", "🐼", "🦄", "🐸", "🐧", "🐢", "🐙"];

  const getRandomLoadingMessage = () => {
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  };

  const getRandomLoadingEmoji = () => {
    return loadingEmojis[Math.floor(Math.random() * loadingEmojis.length)];
  };

  useEffect(() => {
    const startTime = performance.now();
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://script.google.com/macros/s/AKfycbxVwkfaRHsZU1i4zlHxu5gjthhrZVyxgNcWjb580pyDFM80CZ8Sbqrv_FvhJmJpXg5AYQ/exec');
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        console.log('Projects:', response.data);
        setProjects(response.data);
        setLoading(false);
        const fetchTime = performance.now() - startTime;
        console.log(`JSON fetch took ${fetchTime.toFixed(2)}ms`);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
    setTimeout(() => setPageLoaded(true), 100);

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          },
          (err) => {
            console.error('Service Worker registration failed:', err);
          }
        );
      });
    }
  }, []);

  useEffect(() => {
    if (modalProject) {
      const preventScroll = (e) => e.preventDefault();
      document.body.addEventListener('touchmove', preventScroll, { passive: false });
      loadFullImage(currentImageIndex);
      return () => {
        document.body.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [modalProject, currentImageIndex]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = 100;
      const progress = Math.min(scrollPosition / maxScroll, 1);
      setScrollProgress(progress);
      setIsSticky(scrollPosition > maxScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const openModal = (project) => {
    setModalProject(project);
    setCurrentImageIndex(0);
    setModalVisible(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setModalProject(null);
      setImageStatuses({});
    }, 300);
    document.body.classList.remove('modal-open');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev + 1 < modalProject.images.length ? prev + 1 : 0;
      loadFullImage(newIndex);
      return newIndex;
    });
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev - 1 >= 0 ? prev - 1 : modalProject.images.length - 1;
      loadFullImage(newIndex);
      return newIndex;
    });
  };

  const loadFullImage = (index) => {
    const image = modalProject.images[index];
    if (image && !imageStatuses[image.fullUrl]) {
      setImageStatuses((prev) => ({
        ...prev,
        [image.fullUrl]: { loading: true },
      }));
      loadImageWithRetry(image.fullUrl)
        .then(() => {
          setImageStatuses((prev) => ({
            ...prev,
            [image.fullUrl]: { loaded: true },
          }));
        })
        .catch(() => {
          setImageStatuses((prev) => ({
            ...prev,
            [image.fullUrl]: { error: true },
          }));
        });
    }
  };

  const handleImageLoad = (url) => {
    setImageStatuses((prev) => ({
      ...prev,
      [url]: { loaded: true },
    }));
  };

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{
        background: 'radial-gradient(circle, rgba(230, 240, 250, 0.8) 40%, rgba(120, 150, 180, 0.7) 70%, rgba(90, 120, 150, 0.9) 100%)', // Softer powder dark ocean blue-gray gradient
        backgroundSize: 'cover', // Dynamic resizing
        backgroundPosition: 'center', // Centered background
        backgroundRepeat: 'no-repeat',
        zIndex: -1, // Ensure it stays behind other elements
        WebkitBackgroundSize: 'cover',
        WebkitBackgroundPosition: 'center',
        animation: 'backgroundZoom 6s ease-in-out infinite', // Enhanced animation
      }}
    >
      <style>
        {`
          @keyframes backgroundZoom {
            0%, 100% {
              background-size: 100%;
            }
            50% {
              background-size: 120%; // More noticeable zoom effect
            }
          }
        `}
      </style>
      {/* Cache Control and Preload */}
      <meta httpEquiv="Cache-Control" content="public, max-age=86400" />
      {projects.slice(0, 6).map((project, index) => (
        project.thumbnail && (
          <link
            key={index}
            rel="preload"
            href={project.thumbnail.thumbnailUrl}
            as="image"
          />
        )
      ))}

      {/* Sticky Header */}
      <div
        className={`fixed top-0 left-0 w-full bg-white bg-opacity-50 backdrop-blur-md shadow-md z-50 transition-transform duration-300 ${
          isSticky ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-thin uppercase tracking-widest text-black drop-shadow-lg"
            style={{
              opacity: scrollProgress,
              transform: `translateY(${(1 - scrollProgress) * 20}px)`,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
          >
            Nandu Tangella
          </h1>
          <p
            className="text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wide text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            style={{
              opacity: scrollProgress,
              transform: `translateY(${(1 - scrollProgress) * 20}px)`,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
          >
            UI / UX Designer
          </p>
        </div>
      </div>
      <link rel="stylesheet" href="./styles/portfolio.css" />
      {/* Hero Section */}
      <header
        className="text-white py-16"
        style={{
          opacity: 1 - scrollProgress,
          transform: `translateY(${scrollProgress * -20}px)`,
          transition: 'opacity 0.2s, transform 0.2s',
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-thin mb-6 uppercase tracking-widest text-gray-800 drop-shadow-lg relative"
            style={{
              textShadow: '0 4px 10px rgba(255, 255, 255, 0.5)', // Subtle white drop shadow
            }}
          >
            Nandu Tangella
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            <span
              className="relative inline-block font-extrabold text-3xl md:text-4xl uppercase tracking-wide text-white"
            >
              <span
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-lg opacity-50"
                aria-hidden="true"
              ></span>
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                UI / UX Designer
              </span>
            </span>
          </p>
        </div>
      </header>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-6 flex-grow">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2
              className="text-2xl font-semibold sm:text-gray-800 text-white inline-block cursor-pointer"
              style={{
                padding: '0.5rem 1.5rem', // Slightly larger padding for better appearance
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))', // Gradient for glass effect
                borderRadius: '1rem', // Rounded edges for chip effect
                color: 'rgb(50, 50, 50)', // Dark gray color for text
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
                backdropFilter: 'blur(12px)', // Stronger blur for glass effect
                WebkitBackdropFilter: 'blur(12px)', // Safari support for blur
                margin: '0 auto', // Center the chip horizontally
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)', // Subtle text shadow for clarity
                transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth hover effect
              }}
              onClick={() => {
                window.location.href = '/'; // Navigate to the root
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
              }}
            >
              Portfolio
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="relative bg-white bg-opacity-80 backdrop-blur-md shadow-lg rounded-lg overflow-hidden"
                  style={{ borderRadius: '1rem' }}
                >
                  <div className="w-full h-36 skeleton"></div>
                  <div className="p-6">
                    <div className="h-6 w-3/4 mb-2 skeleton"></div>
                    <div className="h-4 w-full skeleton"></div>
                    <div className="h-4 w-5/6 skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : projects.length === 0 ? (
            <p className="text-center text-gray-600">No recent work found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => {
                const renderTime = performance.now();
                return (
                  <div
                    key={index}
                    className="relative bg-white bg-opacity-80 backdrop-blur-md shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 hover:shadow-2xl group cursor-pointer"
                    style={{ borderRadius: '1rem' }}
                    onClick={() => openModal(project)}
                  >
                    {project.thumbnail ? (
                      <div className="relative overflow-hidden">
                        <img
                          src={project.thumbnail.placeholderUrl || 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-400x200.png'}
                          alt={`${project.title} placeholder`}
                          className="w-full h-36 object-cover placeholder"
                          loading="eager"
                        />
                        <img
                          src={project.thumbnail.thumbnailUrl}
                          alt={project.title}
                          className="w-full h-36 object-cover transition-opacity duration-300 absolute top-0 left-0 opacity-0"
                          loading={index < 6 ? 'eager' : 'lazy'}
                          onLoad={(e) => {
                            e.target.style.opacity = '1';
                            console.log(`Thumbnail ${project.thumbnail.thumbnailUrl} loaded in ${(performance.now() - renderTime).toFixed(2)}ms`);
                          }}
                          onError={(e) => {
                            e.target.src = 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-400x200.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                      </div>
                    ) : (
                      <div className="w-full h-36 bg-gray-300 rounded-t-lg"></div>
                    )}
                    <div className="p-6">
                      <h3
                        className="text-xl font-bold text-gray-800 mb-2 transition-colors duration-300 cursor-pointer group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
                      >
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {modalProject && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className={`bg-white w-full h-full mx-0 relative transform transition-all duration-300 overflow-hidden ${
              modalVisible ? 'modal-enter' : 'modal-exit'
            }`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center flex-grow">
                {modalProject.title}
              </h3>
            </div>
            <div className="fixed top-4 right-4 bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-full p-2 z-50">
              <button
                onClick={closeModal}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110"
                aria-label="Close Modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="absolute top-16 bottom-16 left-0 right-0 overflow-y-auto flex items-center justify-center pt-16 group">
              {modalProject.images[currentImageIndex] ? (
                imageStatuses[modalProject.images[currentImageIndex].fullUrl]?.loading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <svg
                      className="animate-spin h-8 w-8 text-purple-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : imageStatuses[modalProject.images[currentImageIndex].fullUrl]?.error ? (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <p className="text-red-600 text-center">
                      Failed to load image: {modalProject.images[currentImageIndex].name}. Please try again.
                    </p>
                  </div>
                ) : (
                  <img
                    src={modalProject.images[currentImageIndex].fullUrl}
                    alt={modalProject.images[currentImageIndex].name}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-gray-300"
                    onLoad={() => handleImageLoad(modalProject.images[currentImageIndex].fullUrl)}
                    onError={(e) => {
                      e.target.src = 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-400x200.png';
                      setImageStatuses((prev) => ({
                        ...prev,
                        [modalProject.images[currentImageIndex].fullUrl]: { error: true },
                      }));
                    }}
                  />
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <p className="text-gray-600">No image available</p>
                </div>
              )}
            </div>

            {modalProject.images.length > 1 && (
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50">
                <button
                  onClick={prevImage}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110"
                  aria-label="Previous Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex gap-2">
                  {modalProject.images.map((_, index) => (
                    <span
                      key={index}
                      className={`w-3 h-3 rounded-full cursor-pointer ${
                        index === currentImageIndex ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-300'
                      }`}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        loadFullImage(index);
                      }}
                    ></span>
                  ))}
                </div>
                <button
                  onClick={nextImage}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110"
                  aria-label="Next Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="text-gray-600 py-12 mt-auto"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Let's Connect</h3>
            <div className="flex justify-center space-x-4">
              {isPageLoaded && (
                <a
                  href="https://www.linkedin.com/in/nandutangella/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900 transition transform hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.5c0-1.378-.028-3.152-1.922-3.152-1.922 0-2.218 1.502-2.218 3.052v5.6h-3v-10h2.881v1.367h.041c.401-.759 1.379-1.559 2.841-1.559 3.037 0 3.6 2.001 3.6 4.601v5.591z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Nandu Tangella. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

ReactDOM.render(<Portfolio />, document.getElementById('root'));