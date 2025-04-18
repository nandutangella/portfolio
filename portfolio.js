const { useState, useEffect } = React;

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

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <header className="animate-abstract-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 uppercase tracking-widest text-gray-100 drop-shadow-lg">
            Nandu Tangella
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed animate-slide-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 font-bold animate-gradient">
              UI / UX Designer
            </span>
          </p>
          {/* Removed "View My Work" button */}
        </div>
      </header>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-16 bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-400">
            Portfolio
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
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
                    className="bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-2xl border border-gray-200"
                    onClick={() => openModal(project)} // Ensure modal opens on click
                  >
                    {firstImage ? (
                      <div className="thumbnail-hover">
                        <img
                          src={firstImage.url}
                          alt={project.title}
                          className="w-full h-48 object-cover cursor-pointer rounded-t-lg blur-sm transition duration-500 ease-in-out" // Add blur effect
                          loading="lazy" // Add lazy loading
                          onLoad={(e) => e.target.classList.remove('blur-sm')} // Remove blur on load
                          onError={(e) => {
                            e.target.src = 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-400x200.png';
                            e.target.classList.remove('blur-sm'); // Remove blur even if fallback is used
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-300"></div>
                    )}
                    <div className="p-6">
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
          onClick={closeModal} // Close modal when clicking outside
        >
          <div 
            className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-4xl w-full mx-4 p-10 relative transform transition-all duration-300 scale-100 max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-3xl font-bold mb-8 text-center text-gray-800">{modalProject.title}</h3>
            <div className="relative bg-white rounded-lg"> {/* Added rounded-lg for rounded edges */}
              {modalProject.images[currentImageIndex] ? (
                imageStatuses[modalProject.images[currentImageIndex].url]?.loading ? (
                  <div className="w-full h-[30rem] flex items-center justify-center"> {/* Adjusted height */}
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : imageStatuses[modalProject.images[currentImageIndex].url]?.error ? (
                  <div className="w-full h-[30rem] flex items-center justify-center bg-gray-100">
                    <p className="text-red-600 text-center">Failed to load image: {modalProject.images[currentImageIndex].name}</p>
                  </div>
                ) : (
                  <img
                    src={modalProject.images[currentImageIndex].url}
                    alt={modalProject.images[currentImageIndex].name}
                    className="w-full h-[30rem] object-contain rounded-lg shadow-lg border border-gray-300"
                    onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-400x200.png'; }}
                  />
                )
              ) : (
                <div className="w-full h-[30rem] flex items-center justify-center bg-gray-100">
                  <p className="text-gray-600">No image available</p>
                </div>
              )}
              {modalProject.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 focus:outline-none shadow-lg transition-transform duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 focus:outline-none shadow-lg transition-transform duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              {modalProject.images.map((image, index) => {
                const imageStatus = imageStatuses[image.url];
                return (
                  <div key={index} className="relative">
                    {imageStatus?.loading ? (
                      <div className="w-24 h-24 flex items-center justify-center">
                        <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : imageStatus?.error ? (
                      <img
                        src="https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-100x100.png"
                        alt={image.name}
                        className={`w-24 h-24 object-cover cursor-pointer rounded-lg shadow-md border border-gray-300 ${index === currentImageIndex ? 'border-2 border-blue-600' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ) : (
                      <img
                        src={image.url}
                        alt={image.name}
                        className={`w-24 h-24 object-cover cursor-pointer rounded-lg shadow-md border border-gray-300 ${index === currentImageIndex ? 'border-2 border-blue-600' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/nandutangella/portfolio/main/fallback-100x100.png'; }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-700 py-12"> {/* Changed background to light */}
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