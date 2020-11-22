import fs from "fs";
import request from "request";
import { headers, uploadImageUrl } from "./constants";

function leadZero(val) {
  if (val >= 0 && val <= 9) {
    return "0" + val;
  }

  return val;
}

export function getRandomInteger(max) {
  return Math.floor(Math.random() * max);
}

export function getRandomeDiscountEnd() {
  const discountPeriodInDays = getRandomInteger(1000);
  const discountPeriodInMS = discountPeriodInDays * 24 * 60 * 60 * 1000;

  const discountEndTimeStamp = Date.now() + discountPeriodInMS;
  const discountEndDay = new Date(discountEndTimeStamp);

  const discountRepresentation = `${discountEndDay.getFullYear()}-${leadZero(
    discountEndDay.getMonth() + 1
  )}-${leadZero(discountEndDay.getDate())}T22:00:00.000Z`;

  return discountRepresentation;
}

export function getValidDescription(title) {
  if (title.length >= 15) {
    return title;
  }

  let description = title;
  while (description.length < 15) {
    description += " " + title;
  }

  return description;
}

export function getCorrectImageUrl(imageUrl) {
  if (imageUrl.startsWith("http:")) {
    return imageUrl;
  }

  return "http:" + imageUrl;
}

export function uploadImage(url, onSuccess) {
  const fileExtension = url.split(".").pop();
  const fileName = `${Date.now()}${getRandomInteger(1000000)}.${fileExtension}`;

  // download to a local file
  request.head(url, function(err, res, body) {
    request(url)
      .on("error", err => {
        console.log("error saving image to a local file", err);
      })
      .pipe(fs.createWriteStream(fileName))
      .on("close", () => {
        // upload
        const req = request.post(
          {
            url: uploadImageUrl,
            headers
          },
          function(err, resp, body) {
            if (err) {
              console.log("Error uploading image", err);
            } else {
              let parsedBody = {};
              try {
                parsedBody = JSON.parse(body);
              } catch (err) {
                console.log("error parsing body", body, err);
              }
              const { message, images } = parsedBody;
              if (message === "done") {
                console.log("Image uploaded " + fileName);

                onSuccess(images[0]);
              } else {
                console.log("something strange while uploading image", body);
              }
            }
          }
        );

        const form = req.form();
        form.append("images", fs.createReadStream(fileName), {
          filename: fileName,
          contentType: `image/${fileExtension}`
        });
      });
  });
}
