const { useState, useEffect, useRef } = React; // Import useRef for touch handling

// Utility to retry image loading
const loadImageWithRetry = (url, retries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      // Check image dimensions to ensure quality
      if (img.naturalWidth < 400 || img.naturalHeight < 200) {
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

// Utility to preload images with concurrency control
const preloadImagesWithConcurrency = async (images, maxConcurrency = 5) => {
  const queue = [...images];
  const results = [];
  const workers = Array.from({ length: maxConcurrency }, async () => {
    while (queue.length) {
      const image = queue.shift();
      try {
        const result = await loadImageWithRetry(image.url, 1);
        results.push(result);
      } catch (err) {
        console.error(`Failed to preload image: ${image.url}`, err);
        results.push(null); // Return null for failed images
      }
    }
  });
  await Promise.all(workers);
  return results;
};

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalProject, setModalProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStatuses, setImageStatuses] = useState({}); // Track image loading status
  const [pageLoaded, setPageLoaded] = useState(false); // Track if the page has loaded

  const touchStartX = useRef(null); // Track the starting X position of a touch
  const touchEndX = useRef(null); // Track the ending X position of a touch

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      if (Math.abs(diffX) > 50) { // Minimum swipe distance
        if (diffX > 0) {
          nextImage(); // Swipe left to go to the next image
        } else {
          prevImage(); // Swipe right to go to the previous image
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://script.google.com/macros/s/AKfycbxVwkfaRHsZU1i4zlHxu5gjthhrZVyxgNcWjb580pyDFM80CZ8Sbqrv_FvhJmJpXg5AYQ/exec');
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        console.log('Projects:', response.data);

        // Preload images with concurrency control
        const allImages = response.data.flatMap(project => project.images);
        await preloadImagesWithConcurrency(allImages);

        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();

    // Trigger the animation after the component mounts
    setTimeout(() => setPageLoaded(true), 100); // Delay to ensure animation is visible
  }, []);

  const openModal = (project) => {
    setModalProject(project);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    setModalProject(null);
    document.body.style.overflow = 'auto'; // Restore background scrolling
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev + 1 < modalProject.images.length ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev - 1 >= 0 ? prev - 1 : modalProject.images.length - 1
    );
  };

  const handleImageLoad = (url) => {
    setImageStatuses((prev) => ({
      ...prev,
      [url]: { loaded: true },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-gray-200 via-gray-400 to-white animate-radial-breathing-vertical font-sans flex flex-col"> {/* Updated to animate-radial-breathing-vertical */}
      {/* Hero Section */}
      <header className="text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight mb-6 uppercase tracking-widest text-gray-800 drop-shadow-lg"> {/* Adjusted text color */}
            Nandu Tangella
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed animate-slide-up">
            <span className="bg-clip-text text-transparent animate-metallic-text-slow font-bold text-2xl md:text-3xl"> {/* Increased font size */}
              UI / UX Designer
            </span>
          </p>
        </div>
      </header>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-16 flex-grow"> {/* Removed separate background */}
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-100"> {/* Adjusted text color */}
            Portfolio
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${
                    pageLoaded ? 'animate-placeholder-bottom-to-top' : ''
                  }`} // Add animation class if the page has loaded
                >
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
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
                const firstImage = project.images[0];
                const imageStatus = firstImage ? imageStatuses[firstImage.url] : null;
                return (
                  <div
                    key={index}
                    className={`bg-white bg-opacity-70 backdrop-blur-md shadow-lg rounded-lg overflow-hidden transform transition hover:bg-opacity-100 hover:scale-105 hover:shadow-2xl`} // Removed animate-bottom-to-top
                    style={{ borderRadius: '0.5rem' }} // Explicitly set border radius
                    onClick={() => openModal(project)} // Ensure modal opens on click
                  >
                    {firstImage ? (
                      <div className="thumbnail-hover">
                        <img
                          src={firstImage.url}
                          alt={project.title}
                          className="w-full h-48 object-cover cursor-pointer rounded-t-lg" // Removed transition-opacity and opacity classes
                          loading="lazy" // Add lazy loading
                          onLoad={(e) => {
                            handleImageLoad(firstImage.url); // Trigger animation on load
                          }}
                          onError={(e) => {
                            e.target.src = 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-400x200.png';
                            handleImageLoad(firstImage.url); // Trigger animation even if fallback is used
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-300 rounded-t-lg"></div> // Adjusted for edge-to-edge
                    )}
                    <div className="p-4">
                      <h3 className="text-2xl font-bold mb-3 text-gray-800 cursor-pointer uppercase tracking-wide">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 leading-loose cursor-pointer border-t border-gray-300 pt-2">
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
            className="bg-white w-full h-full mx-0 relative transform transition-all duration-300 overflow-hidden" // Added overflow-hidden
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart} // Add touch start handler
            onTouchEnd={handleTouchEnd} // Add touch end handler
          >
            {/* Fixed Header */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50"> {/* Chip-like design */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center flex-grow"> {/* Adjusted text sizes */}
                {modalProject.title}
              </h3>
            </div>
            <div className="fixed top-4 right-4 bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-full p-2 z-50"> {/* Chip for X */}
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

            {/* Scrollable Image Container */}
            <div className="absolute top-16 bottom-16 left-0 right-0 overflow-y-auto flex items-center justify-center pt-16 group">
              {modalProject.images[currentImageIndex] ? (
                imageStatuses[modalProject.images[currentImageIndex].url]?.loading ? (
                  <div className="flex items-center justify-center w-full h-full"> {/* Adjusted to fill container */}
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : imageStatuses[modalProject.images[currentImageIndex].url]?.error ? (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <p className="text-red-600 text-center">Failed to load image: {modalProject.images[currentImageIndex].name}</p>
                  </div>
                ) : (
                  <img
                    src={modalProject.images[currentImageIndex].url}
                    alt={modalProject.images[currentImageIndex].name}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-lg border border-gray-300" // Ensure image fits within container
                    onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-400x200.png'; }}
                  />
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <p className="text-gray-600">No image available</p>
                </div>
              )}
            </div>

            {/* Fixed Bottom Navigation */}
            {modalProject.images.length > 1 && (
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50"> {/* Adjusted bg-opacity */}
                <button
                  onClick={prevImage}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110" // Updated arrow color
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
                      }`} // Updated active dot color
                      onClick={() => setCurrentImageIndex(index)}
                    ></span>
                  ))}
                </div>
                <button
                  onClick={nextImage}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110" // Updated arrow color
                  aria-label="Next Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            {/* Removed Bottom Close Button */}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-600 py-12 mt-auto"> {/* Added mt-auto */}
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Let's Connect</h3>
            <div className="flex justify-center space-x-4">
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
              {/* Removed GitHub link */}
            </div>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Nandu Tangella. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

ReactDOM.render(<Portfolio />, document.getElementById('root'));