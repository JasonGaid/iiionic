import React, { useState, useEffect } from 'react';
import './app.css'; 

  import { useHistory } from 'react-router-dom';
  import axios from 'axios';
  import { IonPopover, IonAlert, IonList, IonItem, IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonFooter, IonModal, IonInput, IonSelect, IonSelectOption, IonIcon, useIonToast } from '@ionic/react';
  import { logOutOutline, listOutline, createOutline, trashOutline, pencilOutline, closeCircleOutline } from 'ionicons/icons';
  

  const Dashboard: React.FC = () => {
    const [isCreatingBlog, setIsCreatingBlog] = useState(false);
    const [present] = useIonToast();
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<any>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryData, setSelectedCategoryData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [popoverState, setShowPopover] = useState({ showPopover: false, event: undefined });
    const [commentContent, setCommentContent] = useState('');
    const [selectedPostComments, setSelectedPostComments] = useState<any[]>([]);
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [editingComment, setEditingComment] = useState<any>(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [editCommentModalOpen, setEditCommentModalOpen] = useState(false);
    const [violationCount, setViolationCount] = useState(0);
    const [showViolationAlert, setShowViolationAlert] = useState(false);
    const [banAlert, setBanAlert] = useState<string | null>(null);
    const [isBanned, setIsBanned] = useState(false); // State variable to track ban status
    const isButtonDisabled = true; // Example condition
    const [userDetails, setUserDetails] = useState<{ ban_status: boolean } | null>(null);
    const history = useHistory();
    
    
    

    useEffect(() => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUser(user);
        fetchCategories();
        fetchPosts();
        
        
      } else {
        history.push('/login');
      }
      
    }, [history]);

    useEffect(() => {
      const fetchReportCount = async () => {
        try {
          if (user) {
            const response = await axios.get(`http://127.0.0.1:8000/api/users/${user.id}`);
            const userData = response.data;
    
            if (userData && userData.report_count !== undefined) {
              const reportCount = userData.report_count;
              const reportCountsToAlert = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26, 28, 29];
    
              if (reportCountsToAlert.includes(reportCount)) {
                present({
                  message: 'Your account has been reported by the System.',
                  duration: 5000, 
                  position: 'top',
                });
              }
            } else {
              console.error('Invalid report count data:', userData);
            }
          }
        } catch (error) {
          console.error('Error fetching report count:', error);
        }
      };
    
      const timer = setInterval(fetchReportCount, 200000); 
    
      // Initial call to fetch report count
      fetchReportCount();
    
      return () => clearInterval(timer);
    }, [user]);

    
    useEffect(() => {
      const fetchBanStatus = async () => {
        try {
          const userString = localStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            const response = await axios.get(`http://127.0.0.1:8000/api/users/${user.id}/ban-status`);
            const userData = response.data;
            if (userData.message === "Your account is banned.") { 
              present({
                message: 'Your account has been banned by the System',
                duration: 5000, 
                position: 'top',
              });
              setIsBanned(true);
            } else {
              setIsBanned(false); 
            }
          } else {
            history.push('/login');
          }
        } catch (error) {
          console.error('Error fetching ban status:', error);
        } 
      };
      const timer = setInterval(fetchBanStatus, 200000);

  
      fetchBanStatus();
      return () => clearInterval(timer);
    }, [history]);
    
    
  

    const checkViolationCount = () => {
      // Define the specific violation counts that trigger the alert
      const violationCountsToAlert = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16,17, 19,20,22,23,25,26,28,29];
    
      if (violationCountsToAlert.includes(violationCount)) {
        setShowViolationAlert(true);
      }
    };

    const checkReportCount = async () => {
      try {
        // Assuming user data is available in the state
        if (user) {
          const response = await axios.get(`http://127.0.0.1:8000/api/users/${user.id}`);
          const userData = response.data;
          const reportCount = userData.report_count;
          // Define the specific violation counts that trigger the alert
          const reportCountsToAlert = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26, 28, 29];
    
          if (reportCountsToAlert.includes(reportCount)) {
            setShowViolationAlert(true);
          }
        }
      } catch (error) {
        console.error('Error checking report count:', error);
      }
    };
    const incrementReportCount = async (userId: number) => {
      try {
        const response = await axios.post(`http://127.0.0.1:8000/api/users/${userId}/report`);
    
        if (response.status === 200) {
          console.log('User report count incremented successfully');
          // Increment the violation count in the state
          setViolationCount(violationCount + 1);
        }
      } catch (error) {
        console.error('Error incrementing report count:', error);
      }
    };

    async function fetchCategories() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        present({
          message: 'Failed to fetch categories',
          duration: 3000,
          position: 'top',
        });
      }
    }

    async function fetchCategoryData(selectedCategory: string) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/categories?name=${selectedCategory}`);
        setSelectedCategoryData(response.data);
      } catch (error) {
        console.error('Error fetching category data:', error);
        present({
          message: 'Failed to fetch category data',
          duration: 3000,
          position: 'top',
        });
      }
    }

    async function createBlog() {
      try {
        // Fetch the user's report count from the database
        const response = await axios.get(`http://127.0.0.1:8000/api/users/${user.id}`);
        const userData = response.data;
        const reportCount = userData.report_count;
    
        // Check if the report count meets the condition
        const reportCountsToAlert = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26, 28, 29];
        if (reportCountsToAlert.includes(reportCount)) {
          present({
            message: 'Your account has been reported. Please wait for 10 seconds before creating a blog.',
            duration: 10000, // Show the message for 10 seconds
            position: 'top',
          });
        }
    
        // Open the modal
        setShowModal(true);
    
        // Continue with creating the blog if the report count is not in the specified list
        if (!category) {
          present({
            message: 'Please select a category',
            duration: 3000,
            position: 'top',
          });
          setShowModal(false); // Close the modal if category is not selected
          return;
        }
    
        setIsCreatingBlog(true);
    
        // Rest of the function code remains unchanged...
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category_id', category.id);
    
        if (imageFile) {
          formData.append('image', imageFile);
        }
    
        const postResponse = await axios.post('http://127.0.0.1:8000/api/create-post', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    
        if (postResponse.status === 201) {
          present({
            message: 'Blog Created Successfully',
            duration: 3000,
            position: 'top',
          });
          setShowModal(false);
          fetchPosts();
          
        } else {
          const responseData = postResponse.data;
          if (responseData.errors) {
            const errorMessages = Object.values(responseData.errors).join(', ');
            present({
              message: `Validation Error: ${errorMessages}`,
              duration: 5000,
              position: 'top',
            });
          } else {
            present({
              message: 'Failed to create blog',
              duration: 3000,
              position: 'top',
            });
          }
        }
      } catch (error) {
        console.error('Error creating blog:', error);
        present({
          message: 'Failed to create blog',
          duration: 3000,
          position: 'top',
        });
      } finally {
        setIsCreatingBlog(false);
      }
    }
    
    
    

    const checkForViolations = (text: string): boolean => {
      // Assuming you have a list of violation categories in your state
      const violationCategories = categories.map(cat => cat.name);

      for (const category of violationCategories) {
          if (text.toLowerCase().includes(category.toLowerCase())) {
              return true; // Violation found
          }
      }
      return false; // No violation found
  };



    async function fetchPosts() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/posts');
        const sortedPosts = [...response.data].sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        present({
          message: 'Failed to fetch posts',
          duration: 3000,
          position: 'top',
        });
      }
    }

    const handleEditPost = async (post: any) => {
  try {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageFile(null);

    // Fetch category details based on category_id
    if (post.category && post.category.id) {
      const response = await axios.get(`http://127.0.0.1:8000/api/categories/${post.category.id}`);
      const categoryData = response.data[0]; // Assuming the response is an array
      console.log('Fetched Category Data:', categoryData); // Log the fetched category data
      setCategory(categoryData);
    } else {
      setCategory(null); // Reset category if no category ID found
    }

    // Set image URL if available
    if (post.image) {
      setImageFile(post.image);
      console.log('Image URL:', post.image); // Log the image URL for debugging
    }

    setShowModal(true); // Open the modal for editing
  } catch (error) {
    console.error('Error handling edit post:', error);
    present({
      message: 'Failed to handle edit post',
      duration: 3000,
      position: 'top',
    });
  }
};

    
    
    const handleDeletePost = async (post: any) => {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/posts/${post.id}`);

        if (response.status >= 200 && response.status < 300) {
          present({
            message: 'Post Deleted Successfully',
            duration: 3000,
            position: 'top',
          });
          fetchPosts();
        } else {
          present({
            message: 'Failed to delete post',
            duration: 3000,
            position: 'top',
          });
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        present({
          message: 'Failed to delete post',
          duration: 3000,
          position: 'top',
        });
      }
    };

    const handleEditSubmit = async (event:any) => {
      event.preventDefault()
      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (!category || !category.id) {
          // Notify the user to select a category
          present({
            message: 'Please select a category',
            duration: 10000,
            position: 'top',
          });
          return; // Exit the function early if category is empty
        }

       setCategory(category.id)
    
        // Append category_id if category exists and has an id
        if (category && category.id) {
          formData.append('category_id', category.id);
        }
        
    
        // Check if the image file has changed
        if (imageFile && imageFile instanceof File) {
          // Append the new image file to the form data
          formData.append('image', imageFile);
        }
    
        await axios.put(`http://127.0.0.1:8000/api/posts/${editingPost.id}`, {title, content, category, imageFile
          // headers: {
          //   'Content-Type': 'multipart/form-data',
          // },
          
        }).then((e)=>{
          console.log(e)
          console.log(category.id)
        }).catch((e)=>{
          console.log(e)
        })
        setShowModal(false);
        fetchPosts();
    
        // if (response.status === 200) {
        //   present({
        //     message: 'Post Updated Successfully',
        //     duration: 3000,
        //     position: 'top',
        //   });
        //   setShowModal(false);
        //   fetchPosts();
        // } else {
        //   present({
        //     message: 'Failed to update post',
        //     duration: 3000,
        //     position: 'top',
        //   });
        // }
      } catch (error) {
        console.error('Error updating post:', error);
        present({
          message: 'Failed to update post',
          duration: 3000,
          position: 'top',
        });
      }
    };
    
    


    const addComment = async (postId: number) => {
      try {
        if (!commentContent.trim()) {
          // If commentContent is empty or contains only whitespace
          present({
            message: 'Please enter a comment',
            duration: 3000,
            position: 'top',
          });
          return; // Stop execution
        }
    
        const response = await axios.post(`http://127.0.0.1:8000/api/posts/${postId}/comments`, {
          post_id: postId,
          content: commentContent,
          user_id: user.id
        });
        
        if (response.status === 201) {
          present({
            message: 'Comment Added Successfully',
            duration: 3000,
            position: 'top',
          });
          setCommentContent(''); 
          fetchPosts();
        } else {
          present({
            message: 'Failed to add comment',
            duration: 3000,
            position: 'top',
          });
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        present({
          message: 'Failed to add comment',
          duration: 3000,
          position: 'top',
        });
      }
    };
    

  const handleShowComments = async (postId: number) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/posts/${postId}/comments`);
      setSelectedPostComments(response.data.comments); // Update to access the 'comments' array
      setCommentModalOpen(true); // Open the modal to show comments
    } catch (error) {
      console.error('Error fetching comments:', error);
      present({
        message: 'Failed to fetch comments',
        duration: 3000,
        position: 'top',
      });
    }
  };


//DeleteComment
const handleDeleteComment = async (comment: any) => {
  try {
    if (!comment || !comment.id) {
      present({
        message: 'Invalid comment',
        duration: 3000,
        position: 'top',
      });
      return;
    }

    const response = await axios.delete(`http://127.0.0.1:8000/api/comments/${comment.id}`);

    if (response.status >= 200 && response.status < 300) {
      present({
        message: 'Comment Deleted Successfully',
        duration: 3000,
        position: 'top',
      });
      // Remove the deleted comment from the selectedPostComments array
      setSelectedPostComments(selectedPostComments.filter(c => c.id !== comment.id));
    } else {
      present({
        message: 'Failed to delete comment',
        duration: 3000,
        position: 'top',
      });
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    present({
      message: 'Failed to delete comment',
      duration: 3000,
      position: 'top',
    });
  }
};


const handleEditCommentModal = (comment: any) => {
  setEditingComment(comment);
  setEditCommentContent(comment.content);
  setEditCommentModalOpen(true); // Open the edit comment modal
};
const handleCloseEditCommentModal = () => {
  setEditCommentModalOpen(false);
};

const handleEditCommentSubmit = async () => {
  try {
    const response = await axios.put(`http://127.0.0.1:8000/api/comments/${editingComment.id}`, {
      content: editCommentContent
    });

    if (response.status === 200) {
      present({
        message: 'Comment Updated Successfully',
        duration: 3000,
        position: 'top',
      });

      // Close the edit comment modal
      setEditCommentModalOpen(false);

      // Fetch the updated comments for the post
      const postId = editingComment.post_id; // Assuming postId is accessible from editingComment
      const updatedCommentsResponse = await axios.get(`http://127.0.0.1:8000/api/posts/${postId}/comments`);
      const updatedComments = updatedCommentsResponse.data.comments;
      setSelectedPostComments(updatedComments);

    } else {
      present({
        message: 'Failed to update comment',
        duration: 3000,
        position: 'top',
      });
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    present({
      message: 'Failed to update comment',
      duration: 3000,
      position: 'top',
    });
  }
};

    
    const handleLogout = () => {
      localStorage.removeItem('user'); // Remove user from local storage
      history.push('/login');
      window.location.reload(); // Force reload of the page
    };

    

    return (
      <IonPage>
        {user && (
          <IonHeader>
            <IonToolbar>
              <IonTitle>Blogging Platform</IonTitle>
              <IonItem lines="none" slot="end">
              <IonButton
                onClick={(e: any) => setShowPopover({ showPopover: true, event: e.nativeEvent })}
                className="welcome-button">
                Welcome, {user.name}
              </IonButton>
                <IonPopover
                  isOpen={popoverState.showPopover}
                  event={popoverState.event}
                  onDidDismiss={() => setShowPopover({ showPopover: false, event: undefined })}
                >
                  <IonList>
                    <IonItem button onClick={handleLogout}>
                      <IonIcon icon={logOutOutline} style={{ color: 'red', marginRight: '8px' }} /> Logout
                    </IonItem>
                  </IonList>
                </IonPopover>
              </IonItem>
            </IonToolbar>
          </IonHeader>
        )}
        {user && (
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonButton
                    disabled={isCreatingBlog || isBanned} // Disable the button if user is creating a blog or is banned
                    onClick={() => {
                    setEditingPost(null);
                    setTitle('');
                    setContent('');
                    setCategory(null);
                    setImageFile(null);
                    setShowModal(true);
                  }}
                >
                  <IonIcon icon={createOutline} style={{ marginRight: '8px' }} /> Create Blog
                </IonButton>
              </IonItem>
            </IonList>
            {posts.map((post, index) => (
              <IonCard key={index}>
                <IonCardHeader>
                  <IonCardTitle>{post.title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>{post.content}</p>
                  {post.image && <img src={`http://127.0.0.1:8000/${post.image}`} alt="Blog" style={{ width: '100%', maxWidth: '200px' }} />}
                  <IonCardSubtitle>Posted by: {post.user.name}</IonCardSubtitle>
                  <hr style={{ borderTop: '1px solid #ddd', margin: '10px 0' }} /> {/* Horizontal line */}
                  
                </IonCardContent>
                {user && user.id === post.user.id && (
                  <IonFooter>
                    <IonButton  disabled={isBanned} onClick={() => handleEditPost(post)} style={{ '--background': 'green' }}>
                   
                      <IonIcon icon={pencilOutline} style={{ marginRight: '8px' }} /> Edit
                    </IonButton>
                    <IonButton disabled={isBanned}onClick={() => handleDeletePost(post)} style={{ '--background': 'red' }}>
                      <IonIcon icon={trashOutline} style={{ marginRight: '8px' }} /> Delete
                    </IonButton>
                  </IonFooter>
                  
                )}

                  <IonItem>
                    <IonInput
                      placeholder="Add a comment..."
                      value={commentContent}
                      onIonChange={(e: any) => setCommentContent(e.target.value)}
                    />
                    <IonButton disabled={isBanned} onClick={() => addComment(post.id)} color="primary">
                      <IonIcon icon={createOutline } />
                    </IonButton>
                    <IonButton disabled={isBanned} onClick={() => handleShowComments(post.id)} color="primary">
                    <IonIcon icon={listOutline} />
                    </IonButton>
                  </IonItem>

              </IonCard>
            ))}
          </IonContent>
        )}

        
        
    <IonModal isOpen={showModal && !editingPost}>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Create Blog</IonTitle>
        <IonButton slot="end" onClick={() => setShowModal(false)} color="danger">
          <IonIcon icon={closeCircleOutline} />
        </IonButton>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonList>
        <IonItem>
          <IonInput
            name="title"
            type="text"
            label="Title"
            labelPlacement="floating"
            placeholder="Enter Title"
            value={title}
            onIonChange={(e: any) => setTitle(e.target.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            name="content"
            type="text"
            label="Content"
            labelPlacement="floating"
            placeholder="Enter Content"
            value={content}
            onIonChange={(e: any) => setContent(e.target.value)}
          />
        </IonItem>
        <IonItem>
          <IonSelect
            name="category"
            placeholder="Select Category"
            value={category && category.id}
            onIonChange={(e: any) => {
              const selectedCategoryId = e.detail.value;
              const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
              setCategory(selectedCategory);
              fetchCategoryData(selectedCategoryId);
            }}
          >
            {categories.map((cat) => (
              <IonSelectOption key={cat.id} value={cat.id}>
                {cat.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <IonItem>
          <input type="file" accept="image/*" onChange={(e: any) => setImageFile(e.target.files[0])} />
        </IonItem>
        {imageFile && ( 
          <IonItem>
            <img src={imageFile instanceof File ? URL.createObjectURL(imageFile) : imageFile} alt="Post Image" style={{ width: '100%', maxWidth: '200px' }} />
          </IonItem>
        )}
      </IonList>
      <IonButton onClick={createBlog} expand="full">
        Create Blog
      </IonButton>
    </IonContent>
  </IonModal>

  <IonModal isOpen={showModal && editingPost !== null}>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Edit Post</IonTitle>
        <IonButton slot="end" onClick={() => setShowModal(false)} color="danger">
          <IonIcon icon={closeCircleOutline} />
        </IonButton>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonList>
        <IonItem>
          <IonInput
            name="title"
            type="text"
            label="Title"
            labelPlacement="floating"
            placeholder="Enter Title"
            value={title}
            onIonChange={(e: any) => setTitle(e.target.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            name="content"
            type="text"
            label="Content"
            labelPlacement="floating"
            placeholder="Enter Content"
            value={content}
            onIonChange={(e: any) => setContent(e.target.value)}
          />
        </IonItem>
  
        <IonItem>
          <IonSelect
            name="category"
            placeholder="Select Category"
            value={category && category.id}
            onIonChange={(e: any) => {
              const selectedCategoryId = e.detail.value;
              const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
              setCategory(selectedCategory);
              fetchCategoryData(selectedCategoryId);
            }}
          >
            
            {categories.map((cat) => (
              <IonSelectOption key={cat.id} value={cat.id}>
                {cat.name}
              </IonSelectOption>
             
            ))}
          </IonSelect>
        </IonItem>
        <IonItem>
          <input type="file" accept="image/*" onChange={(e: any) => setImageFile(e.target.files[0])} />
        </IonItem>
        {imageFile && ( 
          <IonItem>
            <img src={imageFile instanceof File ? URL.createObjectURL(imageFile) : imageFile} alt="Post Image" style={{ width: '100%', maxWidth: '200px' }} />
          </IonItem>
        )}
      </IonList>
      <IonButton onClick={handleEditSubmit} expand="full">
        Update Post
      </IonButton>
    </IonContent>
  </IonModal>

  <IonModal isOpen={commentModalOpen} onDidDismiss={() => setCommentModalOpen(false)}>
  <IonHeader>
    <IonToolbar>
      <IonTitle>Comments</IonTitle>
      <IonButton slot="end" onClick={() => setCommentModalOpen(false)} color="danger">
        <IonIcon icon={closeCircleOutline} />
      </IonButton>
    </IonToolbar>
  </IonHeader>
  <IonContent>
  {selectedPostComments.length > 0 ? (
    <IonList>
      {selectedPostComments.map((comment, index) => (
        <IonItem key={index}>
          <p>
            Commented by:<strong>{comment.user.name}</strong>

            <br />
            {comment.content}
          </p>
          {user && user.id === comment.user.id && ( // Check if logged-in user is the author of the comment
            <>
              <IonButton onClick={() => handleEditCommentModal(comment)} color="success">
              <IonIcon icon={pencilOutline} style={{ marginRight: '8px' }} /> Edit
            </IonButton>
            <IonButton onClick={() => handleDeleteComment(comment)} color="danger">
              <IonIcon icon={trashOutline} style={{ marginRight: '8px' }} /> Delete
            </IonButton>
            </>
          )}
        </IonItem>
      ))}
    </IonList>
  ) : (
    <p>No comments to show.</p>
  )}
</IonContent>

  <IonFooter>
  </IonFooter>
</IonModal>

<IonModal isOpen={editCommentModalOpen} onDidDismiss={() => setEditCommentModalOpen(false)}>
  <IonHeader>
    <IonToolbar>
      <IonTitle>Edit Comment</IonTitle>
      <IonButton slot="end" onClick={() => setEditCommentModalOpen(false)} color="danger">
        <IonIcon icon={closeCircleOutline} />
      </IonButton>
    </IonToolbar>
  </IonHeader>
  <IonContent>
    <IonList>
      <IonItem>
        <IonInput
          name="editCommentContent"
          type="text"
          label="Edit Comment"
          labelPlacement="floating"
          placeholder="Enter updated comment content"
          value={editCommentContent}
          onIonChange={(e: any) => setEditCommentContent(e.target.value)}
        />
      </IonItem>
    </IonList>
    <IonButton onClick={handleEditCommentSubmit} expand="full">
      Update Comment
    </IonButton>
    <IonButton onClick={() => setEditCommentModalOpen(false)} expand="full" color="medium">
      Cancel
    </IonButton>
  </IonContent>
</IonModal>


          <IonAlert
            isOpen={banAlert !== null} // Check if banAlert is not null before rendering the alert
            header="Alert"
            message={banAlert || ''} // Use an empty string if banAlert is null
            buttons={['OK']}
            onDidDismiss={() => setBanAlert(null)}
          />

      </IonPage>
    );
  };

  export default Dashboard;