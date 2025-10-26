"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebaseClient";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
// Note: Using OpenAI for text analysis and HTML/CSS for visual generation (perfect text clarity)

import { 
  PlusIcon,
  FolderIcon,
  PhotoIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  createdAt: string;
}

interface Folder {
  id: string;
  name: string;
  createdAt: any; // Firebase Timestamp
  visualCount: number;
}

interface Visual {
  id: string;
  title: string;
  type: 'comic' | 'flowchart' | 'infographic';
  folderId: string;
  createdAt: any; // Firebase Timestamp
  thumbnail: string;
  content?: any;
  originalText?: string;
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [recentVisuals, setRecentVisuals] = useState<Visual[]>([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showTextConverter, setShowTextConverter] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<'comic' | 'flowchart' | 'infographic'>('comic');
  const [converting, setConverting] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  
  // Image variation selection states
  const [showVariationSelector, setShowVariationSelector] = useState(false);
  const [visualVariations, setVisualVariations] = useState<Array<{
    id: number, 
    url: string, 
    seed: number
  }>>([]);
  const [, setSelectedVariation] = useState<number | null>(null);
  const [pendingVisualData, setPendingVisualData] = useState<any>(null);
  
  // Navigation and viewing states
  const [currentView, setCurrentView] = useState<'dashboard' | 'folder'>('dashboard');
  const [viewingFolder, setViewingFolder] = useState<Folder | null>(null);
  const [folderVisuals, setFolderVisuals] = useState<Visual[]>([]);
  
  // Modal states
  const [showVisualViewer, setShowVisualViewer] = useState(false);
  const [viewingVisual, setViewingVisual] = useState<Visual | null>(null);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'folder' | 'visual', item: Folder | Visual} | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingFolder, setLoadingFolder] = useState(false);



  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Firebase data loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("User authenticated:", currentUser.uid);
        setUser(currentUser);
        
        // Fetch user data from Firestore
        try {
          console.log("Attempting to fetch user data from Firestore...");
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
            console.log("User data loaded successfully");
          } else {
            console.log("No user document found, creating one...");
            // Create user document if it doesn't exist
            const newUserData = {
              firstname: currentUser.displayName?.split(' ')[0] || 'User',
              lastname: currentUser.displayName?.split(' ')[1] || '',
              email: currentUser.email || '',
              createdAt: new Date().toISOString()
            };
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          console.error("Error details:", {
            code: (error as any)?.code,
            message: (error as any)?.message,
            stack: (error as any)?.stack
          });
        }
      } else {
        setUser(null);
        setUserData(null);
        window.location.href = "/login";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load folders and visuals from Firebase
  useEffect(() => {
    if (!user) return;

    console.log("Loading data for user:", user.uid);
    
    // Load folders without real-time listener first to debug
    const loadFolders = async () => {
      try {
        const foldersRef = collection(db, `users/${user.uid}/folders`);
        const foldersQuery = query(foldersRef, orderBy("createdAt", "desc"));
        const foldersSnapshot = await getDocs(foldersQuery);
        
        const foldersData = foldersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Folder[];
        
        console.log("Folders loaded:", foldersData.length);
        setFolders(foldersData);
      } catch (error) {
        console.error("Error loading folders:", error);
        // Set empty array on error to avoid crashes
        setFolders([]);
      }
    };

    // Load recent visuals
    const loadVisuals = async () => {
      try {
        const visualsRef = collection(db, `users/${user.uid}/visuals`);
        const visualsQuery = query(visualsRef, orderBy("createdAt", "desc"), limit(6));
        const visualsSnapshot = await getDocs(visualsQuery);
        
        const visualsData = visualsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Visual[];
        
        console.log("Visuals loaded:", visualsData.length);
        setRecentVisuals(visualsData);
      } catch (error) {
        console.error("Error loading visuals:", error);
        // Set empty array on error to avoid crashes
        setRecentVisuals([]);
      }
    };

    loadFolders();
    loadVisuals();
  }, [user]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-200 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  // Real Firebase functions
  const createNewFolder = async () => {
    if (!user || !newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    console.log("Creating folder for user:", user.uid, "with name:", newFolderName);

    try {
      const foldersRef = collection(db, `users/${user.uid}/folders`);
      const docRef = await addDoc(foldersRef, {
        name: newFolderName.trim(),
        createdAt: new Date(), // Use regular Date instead of serverTimestamp for now
        visualCount: 0
      });
      
      console.log("Folder created successfully with ID:", docRef.id);
      
      // Add to local state immediately for better UX
      const newFolder: Folder = {
        id: docRef.id,
        name: newFolderName.trim(),
        createdAt: new Date(),
        visualCount: 0
      };
      
      console.log("Adding new folder to state:", newFolder);
      setFolders(prev => {
        const updated = [newFolder, ...prev];
        console.log("Updated folders state:", updated);
        return updated;
      });
      
      setNewFolderName("");
      setShowNewFolderModal(false);
      console.log('Folder created and state updated successfully!');
    } catch (error) {
      console.error('Error creating folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create folder: ${errorMessage}`);
    }
  };

  const convertTextToVisual = async () => {
    if (!user || !inputText.trim() || !selectedFolder) {
      alert('Please enter text and select a folder');
      return;
    }

    setConverting(true);
    
    try {
      // Import AI functions dynamically to avoid build issues
      const { analyzeTextWithOpenAI, generateImageWithDALLE, generateImagePlaceholder } = await import('../lib/aiClient');
      
      console.log('Analyzing text with OpenAI...');
      
      // Use OpenAI to analyze and structure the text
      const visualData = await analyzeTextWithOpenAI(inputText, selectedFormat);
      
      console.log('OpenAI analysis complete:', visualData);

      // Generate image prompt optimized for Ideogram AI's superior text rendering
      const imagePrompt = `Create a HIGHLY READABLE educational ${selectedFormat} about: "${inputText}". 

IDEOGRAM AI TEXT OPTIMIZATION:
- Use LARGE, BOLD, SANS-SERIF text (minimum 48pt equivalent)
- Perfect text clarity and crisp rendering
- High contrast: BLACK text on WHITE backgrounds or WHITE text on DARK backgrounds
- NO decorative fonts, cursive, or script fonts
- Text should be the PRIMARY focus of the image
- Make text elements large and prominently placed
- Ensure perfect spelling and text accuracy

${selectedFormat === 'comic' ? `
COMIC STYLE: Educational comic strip optimized for Ideogram's text rendering
- 3-4 clear panels with LARGE, READABLE speech bubbles and captions
- Use Ideogram's superior text quality for dialogue and narration
- Bold, clear text in speech bubbles (minimum 24pt equivalent)
- Simple backgrounds that don't interfere with text readability
- Text should be perfectly spelled and clearly rendered
- Use high contrast for all text elements
- Make text the story-telling element, not just visual metaphors
` : selectedFormat === 'flowchart' ? `
FLOWCHART STYLE: Process diagram leveraging Ideogram's text excellence
- Clean geometric shapes with CRYSTAL CLEAR text labels
- Each step should have concise, readable text (2-4 words maximum)
- Use Ideogram's text rendering for perfect clarity on all labels
- Color-coded steps: Start (green), Process (blue), Decision (yellow), End (red)
- Bold, readable text inside each shape
- High contrast text on solid colored backgrounds
- Arrows with clear directional labels when needed
` : `
INFOGRAPHIC STYLE: Data visualization with superior text clarity
- Large, clear headings and labels using Ideogram's text strengths
- Key statistics and data points with perfectly rendered numbers
- Section headers and category labels with maximum readability
- Use text strategically for titles, percentages, and key facts
- Combine charts/graphs with clear textual explanations
- Bold sans-serif fonts for all text elements
- High contrast text placement throughout
`}

CRITICAL TEXT REQUIREMENTS - ACCESSIBILITY PRIORITY:
- ANY TEXT MUST BE HUGE (minimum 48pt font size equivalent)
- Use MAXIMUM contrast: pure white text on dark backgrounds OR pure black text on light backgrounds
- Text must be sans-serif, bold, and extremely legible (like Arial Black or Impact)
- NEVER use small text, decorative fonts, or low-contrast colors
- If text is needed, limit to 1-2 words maximum per element
- Text should be readable from 10 feet away
- No text overlays on busy patterns or complex backgrounds
- Use solid color backgrounds behind any text for maximum readability

VISUAL CLARITY REQUIREMENTS:
- Clean, uncluttered design with lots of white space
- High contrast color schemes (avoid pastels or similar tones)
- Bold, simple shapes and clear visual hierarchy  
- Icons and symbols should be large and immediately recognizable
- Avoid busy patterns, gradients, or complex textures behind important elements

Visual Requirements: Modern, educational, EXTREMELY high-contrast, maximum accessibility for neurodiverse learners, prioritizing visual clarity over decorative elements`;

      console.log('Generating multiple image variations with OpenAI DALL-E 3...');
      
      // Generate multiple image variations using OpenAI DALL-E 3
      let generationResult;
      try {
        generationResult = await generateImageWithDALLE(imagePrompt, selectedFormat);
      } catch (error) {
        console.warn('DALL-E generation failed, using placeholder:', error);
        generationResult = await generateImagePlaceholder(imagePrompt, selectedFormat);
      }

      console.log('Image variations generated successfully:', generationResult);

      // Store the variations and visual data for user selection
      setVisualVariations(generationResult.variations);
      setPendingVisualData({
        title: visualData.title,
        content: visualData,
        imagePrompt: imagePrompt,
        originalText: inputText,
        selectedFormat: selectedFormat,
        selectedFolder: selectedFolder
      });

      // Show variation selector modal
      setShowVariationSelector(true);
      setConverting(false);
      
    } catch (error) {
      console.error('Error converting text:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Full error details:', {
        message: errorMessage,
        error: error
      });
      alert(`Failed to convert text. Error: ${errorMessage}. Check console for details.`);
    } finally {
      setConverting(false);
    }
  };

  const getVisualTypeIcon = (type: 'comic' | 'flowchart' | 'infographic') => {
    switch (type) {
      case 'comic': return PhotoIcon;
      case 'flowchart': return ChartBarIcon;
      case 'infographic': return PuzzlePieceIcon;
    }
  };

  // Helper function to format dates consistently
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Recently';
    
    try {
      // Check if it's a Firebase Timestamp
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString();
      }
      // Check if it's already a Date object
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      }
      // Try to parse as string/number
      return new Date(dateValue).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  // FOLDER FUNCTIONALITY

  const openFolder = async (folder: Folder) => {
    console.log("Opening folder:", folder.name, "with ID:", folder.id);
    setLoadingFolder(true);
    setViewingFolder(folder);
    setCurrentView('folder');
    
    // Load visuals in this folder
    try {
      const visualsRef = collection(db, `users/${user!.uid}/visuals`);
      // Simplified query without ordering to avoid index requirement
      const folderVisualsQuery = query(visualsRef, where('folderId', '==', folder.id));
      console.log('Loading visuals for folder:', folder.id);
      const visualsSnapshot = await getDocs(folderVisualsQuery);
      
      let visualsData = visualsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Visual[];
      
      // Sort by createdAt on the client side since we can't use orderBy without index
      visualsData = visualsData.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime(); // DESC order
      });
      
      console.log(`Loaded ${visualsData.length} visuals for folder:`, folder.name);
      setFolderVisuals(visualsData);
    } catch (error) {
      console.error('Error loading folder visuals:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to load folder contents: ${errorMessage}`);
      setFolderVisuals([]);
    } finally {
      setLoadingFolder(false);
    }
  };

  const editFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setShowEditFolder(true);
  };

  const saveEditFolder = async () => {
    if (!editingFolder || !editFolderName.trim()) return;

    try {
      const folderRef = doc(db, `users/${user!.uid}/folders`, editingFolder.id);
      await updateDoc(folderRef, {
        name: editFolderName.trim()
      });

      // Update local state
      setFolders(prev => prev.map(f => 
        f.id === editingFolder.id ? { ...f, name: editFolderName.trim() } : f
      ));

      setShowEditFolder(false);
      setEditingFolder(null);
      setEditFolderName("");
      alert('Folder renamed successfully!');
    } catch (error) {
      console.error('Error updating folder:', error);
      alert('Failed to rename folder');
    }
  };

  const deleteItem = (type: 'folder' | 'visual', item: Folder | Visual) => {
    setItemToDelete({ type, item });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || deleting) return;

    setDeleting(true);
    console.log('Starting delete operation for:', itemToDelete.type, itemToDelete.item);
    
    try {
      if (itemToDelete.type === 'folder') {
        const folder = itemToDelete.item as Folder;
        console.log('Deleting folder:', folder.name, 'with ID:', folder.id);
        
        // Delete all visuals in folder first
        const visualsRef = collection(db, `users/${user!.uid}/visuals`);
        // Simple query without ordering to avoid index requirements
        const folderVisualsQuery = query(visualsRef, where('folderId', '==', folder.id));
        const visualsSnapshot = await getDocs(folderVisualsQuery);
        
        console.log(`Found ${visualsSnapshot.docs.length} visuals in folder to delete`);
        for (const visualDoc of visualsSnapshot.docs) {
          console.log('Deleting visual:', visualDoc.id);
          await deleteDoc(visualDoc.ref);
        }

        // Delete folder
        await deleteDoc(doc(db, `users/${user!.uid}/folders`, folder.id));
        console.log('Folder deleted from Firebase');
        
        // Update local state
        setFolders(prev => {
          const updated = prev.filter(f => f.id !== folder.id);
          console.log('Updated folders state after deletion:', updated);
          return updated;
        });
        
        // Update recent visuals to remove any from this folder
        setRecentVisuals(prev => prev.filter(v => v.folderId !== folder.id));
        
        // If we're currently viewing this folder, go back to dashboard
        if (viewingFolder?.id === folder.id) {
          console.log('Currently viewing deleted folder, navigating back to dashboard');
          setCurrentView('dashboard');
          setViewingFolder(null);
          setFolderVisuals([]);
        }
        
        console.log('Folder deletion completed successfully');
      } else {
        const visual = itemToDelete.item as Visual;
        console.log('Deleting visual:', visual.title, 'with ID:', visual.id);
        
        // Delete visual
        await deleteDoc(doc(db, `users/${user!.uid}/visuals`, visual.id));
        console.log('Visual deleted from Firebase');
        
        // Update local states
        setRecentVisuals(prev => {
          const updated = prev.filter(v => v.id !== visual.id);
          console.log('Updated recent visuals after deletion:', updated);
          return updated;
        });
        
        setFolderVisuals(prev => {
          const updated = prev.filter(v => v.id !== visual.id);
          console.log('Updated folder visuals after deletion:', updated);
          return updated;
        });
        
        // Update folder visual count
        setFolders(prev => prev.map(f => 
          f.id === visual.folderId 
            ? { ...f, visualCount: Math.max((f.visualCount || 1) - 1, 0) }
            : f
        ));
        
        console.log('Visual deletion completed successfully');
      }

      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to delete ${itemToDelete.type}: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  // VISUAL FUNCTIONALITY  
  const openVisual = (visual: Visual) => {
    console.log("Opening visual:", visual.title, visual);
    console.log("Setting viewing visual to:", visual);
    setViewingVisual(visual);
    console.log("Setting show visual viewer to true");
    setShowVisualViewer(true);
    console.log("Modal state should now be:", { showVisualViewer: true, viewingVisual: visual });
  };

  const backToDashboard = () => {
    setCurrentView('dashboard');
    setViewingFolder(null);
    setFolderVisuals([]);
  };

  // Handle user selection of image variation
  const selectImageVariation = async (variationId: number) => {
    if (!pendingVisualData) return;

    try {
      const selectedVisual = visualVariations.find(v => v.id === variationId);
      if (!selectedVisual) {
        alert('Selected variation not found');
        return;
      }

      console.log(`User selected variation ${variationId} with clearest text`);

      // Enhanced visual data with selected image from DALL-E
      const visualData = {
        ...pendingVisualData.content,
        imageUrl: selectedVisual.url,
        imagePrompt: pendingVisualData.imagePrompt,
        isRenderable: true,
        selectedVariation: variationId,
        variationSeed: selectedVisual.seed
      };

      // Save to Firebase
      const visualsRef = collection(db, `users/${user!.uid}/visuals`);
      const docRef = await addDoc(visualsRef, {
        title: pendingVisualData.title,
        type: pendingVisualData.selectedFormat,
        folderId: pendingVisualData.selectedFolder,
        createdAt: new Date(),
        content: visualData,
        originalText: pendingVisualData.originalText,
        thumbnail: selectedVisual.url || 'html-visual' // Use selected variation as thumbnail
      });

      console.log("Visual created with ID:", docRef.id, "using variation", variationId);

      // Create the new visual object for immediate state update
      const newVisual: Visual = {
        id: docRef.id,
        title: pendingVisualData.title,
        type: pendingVisualData.selectedFormat,
        folderId: pendingVisualData.selectedFolder,
        createdAt: new Date(),
        content: visualData,
        originalText: pendingVisualData.originalText,
        thumbnail: selectedVisual.url
      };

      // Update local state immediately
      setRecentVisuals(prev => [newVisual, ...prev.slice(0, 5)]);
      
      // If currently viewing the folder this visual was saved to, update folder visuals too
      if (currentView === 'folder' && viewingFolder?.id === pendingVisualData.selectedFolder) {
        setFolderVisuals(prev => [newVisual, ...prev]);
      }

      // Update folder visual count
      setFolders(prev => prev.map(f => 
        f.id === pendingVisualData.selectedFolder 
          ? { ...f, visualCount: (f.visualCount || 0) + 1 }
          : f
      ));

      // Clean up and close modals
      setShowVariationSelector(false);
      setVisualVariations([]);
      setPendingVisualData(null);
      setSelectedVariation(null);
      setInputText("");
      setSelectedFolder("");
      setShowTextConverter(false);

      alert(`${pendingVisualData.selectedFormat.charAt(0).toUpperCase() + pendingVisualData.selectedFormat.slice(1)} created successfully with clearest text variation!`);

    } catch (error) {
      console.error('Error saving selected variation:', error);
      alert('Failed to save selected variation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Logout Button - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-4 py-2 border border-blue-200 text-blue-200 rounded-lg hover:bg-blue-200 hover:text-black transition duration-300 bg-white/10 backdrop-blur-sm"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Visual Learning Studio
          </h1>
          <p className="text-gray-400 text-lg">
            Transform text into comics, flowcharts, and infographics for better learning
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button 
            onClick={() => setShowTextConverter(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Convert Text to Visual</span>
          </button>
          
          <button 
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center space-x-2 px-6 py-3 border border-blue-200 text-blue-200 hover:bg-blue-200 hover:text-black rounded-lg transition duration-300"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Folder</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Folders Section */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {currentView === 'dashboard' ? 'Your Visual Library' : (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={backToDashboard}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <span>{viewingFolder?.name}</span>
                  </div>
                )}
              </h2>
            </div>
            
            {/* Folders Grid or Folder View */}
            {currentView === 'dashboard' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {folders.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FolderIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">No folders yet</p>
                    <button
                      onClick={() => setShowNewFolderModal(true)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
                    >
                      Create Your First Folder
                    </button>
                  </div>
                ) : (
                  folders.map((folder) => (
                    <div key={folder.id} className="group bg-zinc-900 rounded-xl p-6 border border-zinc-700 hover:border-blue-200 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          onClick={() => openFolder(folder)}
                          className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        >
                          <FolderIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openFolder(folder);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded"
                            title="View Folder"
                          >
                            <EyeIcon className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              editFolder(folder);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded"
                            title="Edit Folder"
                          >
                            <PencilIcon className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem('folder', folder);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded"
                            title="Delete Folder"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                      <h3 
                        onClick={() => openFolder(folder)}
                        className="text-lg font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors cursor-pointer"
                      >
                        {folder.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {folder.visualCount || 0} visuals • Created {formatDate(folder.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Folder Content View */
              <div className="mb-8">
                {loadingFolder ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading folder contents...</p>
                  </div>
                ) : folderVisuals.length === 0 ? (
                  <div className="text-center py-12">
                    <PhotoIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No visuals in this folder yet</p>
                    <p className="text-gray-500 text-sm mb-4">Create some visuals to see them here</p>
                    <button
                      onClick={() => setShowTextConverter(true)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
                    >
                      Create First Visual
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {folderVisuals.map((visual) => {
                      const IconComponent = getVisualTypeIcon(visual.type);
                      return (
                        <div key={visual.id} className="group bg-zinc-900 rounded-lg p-4 border border-zinc-700 hover:border-blue-200 transition-all duration-300">
                          <div className="flex items-start justify-between mb-3">
                            <div 
                              onClick={() => openVisual(visual)}
                              className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors flex-1 mr-3"
                            >
                              <IconComponent className="w-8 h-8 text-gray-500" />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-1">
                              <button 
                                onClick={() => openVisual(visual)}
                                className="p-1 hover:bg-zinc-700 rounded"
                                title="View Visual"
                              >
                                <EyeIcon className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                              </button>
                              <button 
                                onClick={() => deleteItem('visual', visual)}
                                className="p-1 hover:bg-zinc-700 rounded"
                                title="Delete Visual"
                              >
                                <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-300" />
                              </button>
                            </div>
                          </div>
                          <h4 
                            onClick={() => openVisual(visual)}
                            className="text-white font-medium mb-1 group-hover:text-blue-200 transition-colors cursor-pointer"
                          >
                            {visual.title}
                          </h4>
                          <p className="text-gray-400 text-sm capitalize">
                            {visual.type} • {formatDate(visual.createdAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Recent Visuals - Only show on dashboard view */}
            {currentView === 'dashboard' && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Visuals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recentVisuals.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <PhotoIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No visuals created yet</p>
                      <p className="text-gray-500 text-sm">Start by converting some text!</p>
                    </div>
                  ) : (
                    recentVisuals.map((visual) => {
                      const IconComponent = getVisualTypeIcon(visual.type);
                      return (
                        <div key={visual.id} className="group bg-zinc-900 rounded-lg p-4 border border-zinc-700 hover:border-blue-200 transition-all duration-300">
                          <div className="flex items-start justify-between mb-3">
                            <div 
                              onClick={() => openVisual(visual)}
                              className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors flex-1 mr-3"
                            >
                              <IconComponent className="w-8 h-8 text-gray-500" />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={() => deleteItem('visual', visual)}
                                className="p-1 hover:bg-zinc-700 rounded"
                                title="Delete Visual"
                              >
                                <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-300" />
                              </button>
                            </div>
                          </div>
                          <h4 
                            onClick={() => openVisual(visual)}
                            className="text-white font-medium mb-1 group-hover:text-blue-200 transition-colors cursor-pointer"
                          >
                            {visual.title}
                          </h4>
                          <p className="text-gray-400 text-sm capitalize">
                            {visual.type} • {formatDate(visual.createdAt)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-zinc-800 transition-colors flex items-center space-x-3">
                  <PhotoIcon className="w-5 h-5 text-blue-200" />
                  <span className="text-gray-300">Create Comic Strip</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-zinc-800 transition-colors flex items-center space-x-3">
                  <ChartBarIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Make Flowchart</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-zinc-800 transition-colors flex items-center space-x-3">
                  <PuzzlePieceIcon className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Design Infographic</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Visuals Created</span>
                  <span className="text-blue-200 font-bold">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Folders</span>
                  <span className="text-blue-200 font-bold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Learning Hours</span>
                  <span className="text-blue-200 font-bold">24.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Folder Modal */}
        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-700">
              <h3 className="text-xl font-semibold text-white mb-4">Create New Folder</h3>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="w-full p-3 bg-zinc-800 text-white rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={createNewFolder}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName("");
                  }}
                  className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 hover:bg-zinc-800 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Text Converter Modal */}
        {showTextConverter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl w-full max-w-4xl border border-zinc-700 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">Text to Visual Converter</h3>
                  <button
                    onClick={() => setShowTextConverter(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 mt-2">
                  Paste your text content and choose how you'd like it visualized for better learning.
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Input Text</label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full h-64 p-3 bg-zinc-800 text-white rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
                      placeholder="Paste your textbook content, notes, or any text you want to convert into a visual format..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Visual Format</label>
                    <div className="space-y-3 mb-4">
                      <div 
                        onClick={() => setSelectedFormat('comic')}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFormat === 'comic' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-600 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <PhotoIcon className="w-6 h-6 text-blue-400" />
                          <div>
                            <h4 className="text-white font-medium">Comic Strip</h4>
                            <p className="text-gray-400 text-sm">Step-by-step visual story format</p>
                          </div>
                        </div>
                      </div>
                      <div 
                        onClick={() => setSelectedFormat('flowchart')}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFormat === 'flowchart' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-600 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <ChartBarIcon className="w-6 h-6 text-green-400" />
                          <div>
                            <h4 className="text-white font-medium">Flowchart</h4>
                            <p className="text-gray-400 text-sm">Process and decision flow diagram</p>
                          </div>
                        </div>
                      </div>
                      <div 
                        onClick={() => setSelectedFormat('infographic')}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFormat === 'infographic' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-600 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <PuzzlePieceIcon className="w-6 h-6 text-purple-400" />
                          <div>
                            <h4 className="text-white font-medium">Infographic</h4>
                            <p className="text-gray-400 text-sm">Data and information visualization</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Save to Folder</label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full p-3 bg-zinc-800 text-white rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a folder...</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={convertTextToVisual}
                  disabled={converting || !inputText.trim() || !selectedFolder}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                >
                  {converting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Converting...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Generate Visual</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Folder Modal */}
        {showEditFolder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-700">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Folder</h3>
              <input
                type="text"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="w-full p-3 bg-zinc-800 text-white rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={saveEditFolder}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowEditFolder(false);
                    setEditingFolder(null);
                    setEditFolderName("");
                  }}
                  className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 hover:bg-zinc-800 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-700">
              <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this {itemToDelete?.type}?
                {itemToDelete?.type === 'folder' && (
                  <span className="block text-red-400 text-sm mt-2">
                    This will also delete all visuals in this folder!
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 hover:bg-zinc-800 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Viewer Modal - Debug */}
        {(() => { console.log('Rendering modals - showVisualViewer:', showVisualViewer, 'viewingVisual:', viewingVisual); return null; })()}
        {showVisualViewer && viewingVisual && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl w-full max-w-4xl border border-zinc-700 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">{viewingVisual?.title}</h3>
                  <button
                    onClick={() => {
                      console.log('Closing visual viewer');
                      setShowVisualViewer(false);
                      setViewingVisual(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 mt-2 capitalize">
                  {viewingVisual?.type} • Created {viewingVisual?.createdAt ? formatDate(viewingVisual?.createdAt) : 'Unknown'}
                </p>
              </div>
              
              <div className="p-6">
                {/* Visual Display Area - Full Width */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                    <span>Generated Visual</span>
                    <span className="text-xs text-gray-400 bg-zinc-700 px-2 py-1 rounded">
                      {viewingVisual?.type?.toUpperCase()}
                    </span>
                  </h4>
                  <div className="bg-white rounded-lg p-6 min-h-96 max-h-[60vh] overflow-y-auto border">
                    {viewingVisual?.content?.imageUrl ? (
                      <div className="w-full h-full flex flex-col items-center">
                        <img
                          src={viewingVisual.content.imageUrl}
                          alt={viewingVisual.title}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                        <p className="mt-4 text-gray-600 text-sm text-center">
                          Generated with DALL-E 3 • {viewingVisual.content.imagePrompt ? 'AI Generated Visual' : 'Custom Visual'}
                        </p>
                      </div>
                    ) : viewingVisual?.content?.imagePrompt ? (
                      <div className="text-center text-gray-500 py-16">
                        <div className="text-6xl mb-4">🎨</div>
                        <p className="text-lg font-medium">Image Generation In Progress</p>
                        <p className="text-sm mt-2 mb-4">Your visual is being generated...</p>
                        <div className="bg-gray-100 p-4 rounded-lg text-left">
                          <p className="text-xs text-gray-600 font-medium mb-2">Prompt used:</p>
                          <p className="text-xs text-gray-700">{viewingVisual.content.imagePrompt}</p>
                        </div>
                      </div>
                    ) : viewingVisual?.content ? (
                      <div className="text-gray-800">
                        <h5 className="text-xl font-bold text-gray-900 mb-4">{viewingVisual?.content?.title || 'Untitled'}</h5>
                        <p className="mb-6 text-gray-700 text-lg leading-relaxed">{viewingVisual?.content?.description || 'No description'}</p>
                        
                        {viewingVisual?.content?.sections && viewingVisual?.content?.sections.length > 0 && (
                          <div className="space-y-4">
                            {viewingVisual?.content?.sections.map((section: any, index: number) => (
                              <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-400 shadow-sm">
                                {typeof section === 'string' ? (
                                  <p className="text-gray-800 text-base">{section}</p>
                                ) : (
                                  <div>
                                    <h6 className="font-bold text-blue-800 mb-2 text-lg">{section.title}</h6>
                                    <p className="text-gray-700 leading-relaxed">{section.content}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-16">
                        <div className="text-6xl mb-4">🎨</div>
                        <p className="text-lg font-medium">No visual content available</p>
                        <p className="text-sm mt-2">Create a new visual to see generated images</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Text - Collapsible */}
                <details className="bg-zinc-800 rounded-lg overflow-hidden">
                  <summary className="p-4 cursor-pointer text-white font-medium hover:bg-zinc-700 transition-colors">
                    📝 View Original Text
                  </summary>
                  <div className="p-4 bg-zinc-900 border-t border-zinc-700">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {viewingVisual?.originalText || 'No original text available'}
                    </p>
                  </div>
                </details>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowVisualViewer(false)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Variation Selector Modal */}
        {showVariationSelector && visualVariations.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl w-full max-w-6xl border border-zinc-700 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">Choose the Clearest Text Quality</h3>
                  <button
                    onClick={() => {
                      setShowVariationSelector(false);
                      setVisualVariations([]);
                      setPendingVisualData(null);
                      setConverting(false);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 mt-2">
                  We generated {visualVariations.length} {pendingVisualData?.selectedFormat || 'visual'} variations with extra clear text. 
                  <strong className="text-white">Choose the one where ALL text is most readable and the content matches your topic exactly.</strong>
                </p>
                <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>💡 Look for:</strong> Large, bold text • High contrast colors • Clean layout • Content that directly explains your topic
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visualVariations.map((variation) => (
                    <div key={variation.id} className="group">
                      <div 
                        onClick={() => selectImageVariation(variation.id)}
                        className="relative bg-white rounded-lg p-4 cursor-pointer hover:ring-4 hover:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                      >
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold z-20">
                          Option {variation.id}
                        </div>
                        
                        {/* Render DALL-E generated image */}
                        <div className="w-full h-64 rounded-lg overflow-hidden">
                          <img
                            src={variation.url}
                            alt={`Visual variation ${variation.id}`}
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                          />
                        </div>
                        <div className="mt-3 text-center">
                          <button 
                            onClick={() => selectImageVariation(variation.id)}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 font-medium"
                          >
                            Select This Version
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    💡 <strong>Tip:</strong> Choose the visual that best explains your topic with the clearest, largest text. 
                    Avoid any that look like photographs of real whiteboards or posters - select the clean digital designs.
                  </p>
                  <button
                    onClick={() => {
                      setShowVariationSelector(false);
                      setVisualVariations([]);
                      setPendingVisualData(null);
                      setConverting(false);
                    }}
                    className="px-6 py-2 border border-gray-600 text-gray-300 hover:bg-zinc-800 rounded-lg transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}