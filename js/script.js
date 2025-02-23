const uploadButton = document.getElementById("image_input");
const displayImageCanvas = document.getElementById("display_image");
const ctx = displayImageCanvas.getContext("2d");
const downloadButton = document.getElementById("download");
const container = document.querySelector(".container");
const checkboxLogo = document.getElementById('option-1');
const menu = document.querySelector('.menu');
const downloadMenu = document.querySelector('.download-menu');
const checkbox = document.getElementById('edit');
const tapImage = document.querySelector('.tapImage');
let base_image = new Image();

const MAX_CANVAS_WIDTH = 7000;
const MAX_CANVAS_HEIGHT = 7000;

displayImageCanvas.width = container.offsetWidth;
displayImageCanvas.height = container.offsetHeight;

let uploadedFile = null; // Store the uploaded file globally
let img = new Image();
let showBaseImage = checkboxLogo.checked; // Logo shows initially
let showTime = false; 

let exifData = {};

const buttonState = {
  displayExif: { 
    active: true, 
    label: exifData => `${exifData.focalLength}`+"mm"+"・"+"f/"+`${exifData.aperture}`+"・1/"
    +`${1 / exifData.exposureTime}`+"s"+"・"+"ISO"+`${exifData.iso}` // Dynamic label
  },
  displayTime: { 
    active: false, 
    label: exifData => `${exifData.dateTaken}` 
  },
  displayName: {
    active: false,
    label: () => ""
  }
};

document.getElementById("fname").addEventListener("input", (event) => {
  const userInput = event.target.value || ""; 

  // Make `label` a function
  buttonState.displayName.label = () => userInput;
});

// Usage example
const labelText = buttonState.displayName.label(); // Call the function to get the value
console.log(labelText);

function convertDateTime(dateTime) {
  // Split the string into date and time parts
  const parts = dateTime.split(" ");
  
  // Check if the string is in the expected format with both date and time
  if (parts.length === 2) {
    // Replace colons with dashes in the date part only
    parts[0] = parts[0].replace(/:/g, "/");
    
    // Rejoin the date and time parts, keeping the time part intact
    return parts.join(" ");
  } else {
    // If the dateTime doesn't match the expected format, return it as is
    return dateTime;
  }
}

function drawText(text,centerX,centerY,fontsize,fontface) {
  ctx.save();
  ctx.font=fontsize+'px '+fontface;
  ctx.textBaseline='middle';
  ctx.fillText(text,centerX,centerY);
  ctx.restore();
}

function redraw(img, exifData, base_image, ctx, newWidth, newHeight) {
  console.log("Base image value in redraw:", base_image);
  ctx.clearRect(0, 0, newWidth, newHeight); // Clear canvas
  ctx.drawImage(img, 0, 0, newWidth, newHeight); // Draw main image

  const exifFour = `${exifData.focalLength}`+"mm"+"・"+"f/"+`${exifData.aperture}`+"・1/"
    +`${1 / exifData.exposureTime}`+"s"+"・"+"ISO"+`${exifData.iso}`;

  const activeAxes = Object.keys(buttonState) // Create a string of "On" axes
    .filter(axis => buttonState[axis].active) // Keep active ones
    .map(axis => buttonState[axis].label(exifData));

  console.log(activeAxes);

  if (img.width > img.height) {
    drawText(activeAxes.join('｜'), newWidth * 0.02, newHeight * 0.93 + newHeight * 0.037, newHeight * 0.023, 'sfpro'); 
    if (activeAxes.length === 0) {
      drawText(`${exifData.cameraModel}`, newWidth * 0.02, newHeight * 0.95, newHeight * 0.04, 'sfpromed');
    } else {
      drawText(`${exifData.cameraModel}`, newWidth * 0.02, newHeight * 0.93, newHeight * 0.035, 'sfpromed');
    }
    if (showBaseImage && base_image && base_image.complete) {
      console.log("Drawing base image.");
      ctx.drawImage(base_image, newWidth * 0.935, newHeight * 0.913, newWidth * 0.05, newWidth * 0.05);
    }
  } else { 
    drawText(activeAxes.join('｜'), newWidth * 0.03, newHeight * 0.945 + newHeight * 0.03, newWidth * 0.024, 'sfpro'); 
    if (activeAxes.length === 0) {
      drawText(`${exifData.cameraModel}`, newWidth * 0.03, newHeight * 0.96, newWidth * 0.04, 'sfpromed');
    } else {
      drawText(`${exifData.cameraModel}`, newWidth * 0.03, newHeight * 0.945, newWidth * 0.035, 'sfpromed');
    }
    if (showBaseImage && base_image && base_image.complete) {
      console.log("Drawing base image.");
      ctx.drawImage(base_image, newWidth * 0.91, newHeight * 0.932, newWidth * 0.07, newWidth * 0.07);
    }
  }

  ctx.fillStyle = 'white';
}

uploadButton.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadedFile = file; // Save file globally for download
    EXIF.getData(file, function () {
      exifData.cameraModel = EXIF.getTag(this, "Model");
      exifData.dateTaken = EXIF.getTag(this, "DateTimeOriginal");
      exifData.iso = EXIF.getTag(this, "ISOSpeedRatings");
      exifData.aperture = EXIF.getTag(this, "FNumber");
      exifData.exposureTime = EXIF.getTag(this, "ExposureTime");
      exifData.focalLength = EXIF.getTag(this, "FocalLengthIn35mmFilm");
      console.log("ﾔｼﾞｭｾﾝﾊﾟｲｲｷｽｷﾞﾝｲｸｲｸｱｯｱｯｱｯｱｰﾔﾘﾏｽﾈ");

      if (exifData.dateTaken) {
        exifData.dateTaken = convertDateTime(exifData.dateTaken);  // Fix format
      }
    });
    img.onload = () => {
      const aspectRatio = img.width / img.height;

      // Resize canvas while maintaining aspect ratio
      let newWidth = img.width;
      let newHeight = img.height;

      if (img.width > MAX_CANVAS_WIDTH || img.height > MAX_CANVAS_HEIGHT) {
        if (aspectRatio > 1) {
          newWidth = MAX_CANVAS_WIDTH;
          newHeight = newWidth / aspectRatio;
        } else {
          newHeight = MAX_CANVAS_HEIGHT;
          newWidth = newHeight * aspectRatio;
        }
      }

      displayImageCanvas.width = newWidth;
      displayImageCanvas.height = newHeight;

      document.querySelector('.instructionTxt').style.display = 'none';

      // Draw image and text on canvas
      ctx.clearRect(0, 0, displayImageCanvas.width, displayImageCanvas.height);
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      ctx.fillStyle = "white";

      base_image.src = 'misc/apple_logo.png';
      base_image.onload = () => {
        redraw(img, exifData, base_image, ctx, newWidth, newHeight);
      };
    };
    img.src = URL.createObjectURL(file);
  }
});

downloadButton.addEventListener("click", function (e) {
  if (!uploadedFile) {
    document.getElementById('xyz').play();
    alert("upload an image first idiot");
    return;
  }

  const originalFileName = uploadedFile.name.split(".").slice(0, -1).join(".");
  const downloadFileName = `${originalFileName}_kimchi.jpg`;
  const imageURL = displayImageCanvas.toDataURL("image/jpeg");

  e.stopPropagation(); // Prevents the event from bubbling up immediately
  setTimeout(() => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      downloadMenu.style.display = "flex";
      console.log("iphone");
      tapImage.src = imageURL;
    } else {
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = downloadFileName;
      link.click();
    }
  }, 0); // Delays execution so the other click event finishes first
});

// Add button functionality
container.addEventListener("click", () => {
  console.log(displayImageCanvas.height);
  console.log(displayImageCanvas.width);
});

// Toggle menu visibility when checkbox is checked/unchecked
checkbox.addEventListener('change', function() {
  if (this.checked) {
    menu.style.display = 'flex'; // enable flexbox
    document.getElementById('footer').style.display = 'none';
  } else {
    menu.style.display = 'none';
  }
});

// Close menu when clicking outside of it
document.addEventListener('click', function(e) {
  if (!menu.contains(e.target) && !checkbox.contains(e.target)) {
    menu.style.display = 'none';
    document.getElementById('footer').style.display = 'block';
    checkbox.checked = false;
    console.log("closed2");
  }
  if (!downloadMenu.contains(e.target)) {
    console.log("closed");
    downloadMenu.style.display = 'none';
  }
});

// Logo Boolean
document.querySelectorAll('input[name="displayLogo"]').forEach((radioButton) => {
  radioButton.addEventListener('change', () => {
    const selectedOption = radioButton.id; // Get the selected radio button's ID

    if (uploadedFile) {
      let newWidth = img.width;
      let newHeight = img.height;

      if (selectedOption === 'option-3') {
        console.log("Option 3 selected: Showing base image");
        base_image.src = 'misc/apple_logo.png';
        base_image.onload = () => {
          redraw(img, exifData, base_image, ctx, newWidth, newHeight); // Wait for base image to load
        };
      } else if (selectedOption === 'option-4') {
        console.log("Option 4 selected: Hiding base image");
        base_image.src = '';  // Set base image to an empty string to "hide" it
        redraw(img, exifData, null, ctx, newWidth, newHeight);
      }
    }
  });
});

document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', event => {
    const { name, value } = event.target;

    // Update the state based on the button's name and value
    if (buttonState[name]) {
      buttonState[name].active = value === 'on';
    }

    console.log(event.target.name);
    console.log(event.target.value);

    if (base_image === null) {
      redraw(img, exifData, null, ctx, img.width, img.height);
    } else {
      redraw(img, exifData, base_image, ctx, img.width, img.height);
    }
  });
});

const fullHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', fullHeight);
fullHeight();
