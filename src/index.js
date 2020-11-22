import axios from "axios";
import AliExpressFamilyCategoriesMapper from "../AliExpressFamilyCategoriesMapper.json";
import AliExpressCategoryProducts from "../AliExpressCategoryProducts.json";
import {
  getRandomInteger,
  getRandomeDiscountEnd,
  getValidDescription,
  getCorrectImageUrl,
  uploadImage
} from "./helperFunctions";
import { headers, createProductUrl } from "./constants";

const MAX_IN_STOCK = 1000;

for (let aliExpressCategoryId in AliExpressCategoryProducts) {
  const equivalentFamilyCategory =
    AliExpressFamilyCategoriesMapper[aliExpressCategoryId];
  const products = AliExpressCategoryProducts[aliExpressCategoryId].data.items;

  for (let product of products) {
    const id = product.productId;
    const title = product.productElements.title.title;
    const description = getValidDescription(title);
    const imageUrl = getCorrectImageUrl(product.productElements.image.imgUrl);
    const price = product.productElements.price.sell_price.value;
    const inStock = getRandomInteger(MAX_IN_STOCK);
    const now = Date.now();
    const barCode = now + getRandomInteger(1000000);

    const toBeSubmittedProduct = {
      title,
      details: description,
      categories: [equivalentFamilyCategory],
      price,
      inStock,
      barCode
    };

    // give discount to 20% of products
    if (inStock % 4 === 0) {
      toBeSubmittedProduct.discount = (getRandomInteger(100) / 100).toFixed(2);
      toBeSubmittedProduct.discountEnds = getRandomeDiscountEnd();
    }

    setTimeout(() => {
      uploadImage(imageUrl, imageFileName => {
        toBeSubmittedProduct.images = [imageFileName];

        axios
          .post(
            createProductUrl,
            { product: toBeSubmittedProduct },
            {
              headers
            }
          )
          .then(res => {
            if (res.data.message === "created") {
              console.log(`product ${id} added`);
            } else {
              console.log(
                `success with product ${id} but something strange`,
                res
              );
            }
          })
          .catch(err => {
            console.log(`err Adding product ${id}`, err);
          });
      });
    });
  }
}
