const graphql = require("graphql")
// const TRASH_ID = require("../keys").TRASH_ID

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLFloat,
} = graphql

const Categories = require("../models/category")
const Products = require("../models/product")

const ProductType = new GraphQLObjectType({
  name: "Product",

  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    images: { type: new GraphQLList(GraphQLString) },
    icon: { type: GraphQLString },
    categories: {
      type: new GraphQLList(CategoryType),
      resolve({ categories }, args) {
        return Categories.find({ id: { $in: categories } }, (err, docs) => {
          console.log(docs)
        })
      },
    },
  }),
})

const CategoryType = new GraphQLObjectType({
  name: "Category",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    icons: { type: new GraphQLList(GraphQLString) },
    images: { type: new GraphQLList(GraphQLString) },
    products: {
      type: new GraphQLList(ProductType),
      resolve({ products }, args) {
        return Products.find({ _id: { $in: products } }, (err, docs) => {
          console.log(docs)
        })
      },
    },
  }),
})

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addProduct: {
      type: ProductType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        categories: { type: new GraphQLList(GraphQLString) },
        images: { type: new GraphQLList(GraphQLString) },
        icon: { type: GraphQLString },
      },
      resolve(parent, { name, price, categoryId, images, icon }) {
        console.info("addProduct: ", { name, price, categoryId, images, icon })
        const product = new Products({
          name,
          price,
          categoryId,
          images,
          icon,
        })
        return product.save()
      },
    },
    updateProduct: {
      type: ProductType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        categories: { type: new GraphQLList(GraphQLString) },
        images: { type: new GraphQLList(GraphQLString) },
        icon: { type: GraphQLString },
      },
      resolve(parent, { id, name, price, categories, images, icon }) {
        console.info("updateProduct :", {
          id,
          name,
          price,
          categories,
          images,
          icon,
        })
        return Products.findByIdAndUpdate(
          id,
          { $set: { name, price, categories, images, icon } },
          { new: true }
        )
      },
    },
    deleteProduct: {
      type: ProductType,
      description: "Description deleteProduct",
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, { id }) {
        console.info("deleteProduct :", id)
        return Products.findByIdAndRemove(id)
      },
    },
    addProductsWithoutCategoryInRecycleBin: {
      type: ProductType,
      resolve() {
        const predicate = { categories: [] }
        const projection = { categories: 1 }
        return Products.updateMany(
          predicate,
          { $addToSet: { categories: [process.env.RECYCLE_BIN_ID] } },
          { new: true }
        )
      },
    },
    clearRecycleBin: {
      type: ProductType,
      resolve() {
        return Products.deleteMany({
          categoryes: process.env.RECYCLE_BIN_ID,
        }).then((res) => res)
      },
    },
    deleteCascadeCategoryWithProductsById: {
      type: CategoryType,
      description: "Delete Category with products",
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, { id }) {
        console.info("deleteCascadeCategoryWithProductsById :", id)
        return Products.deleteMany({
          categoryes: id,
        }).then((res) => Categories.findByIdAndRemove(id).then((mes) => mes))
      },
    },
    addCategory: {
      type: CategoryType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        icons: { type: new GraphQLList(GraphQLString) },
        images: { type: new GraphQLList(GraphQLString) },
      },
      resolve(parent, { id, name, images, icons }) {
        console.info("addCategory: ", { id, name, images, icons })
        const category = new Categories({
          id,
          name,
          images,
          icons,
        })
        return category.save()
      },
    },
    updateCategory: {
      type: CategoryType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        images: { type: new GraphQLList(GraphQLString) },
        icons: { type: new GraphQLList(GraphQLString) },
      },
      resolve(parent, { id, name, images, icons }) {
        console.info("updateCategory :", {
          id,
          name,
          images,
          icons,
        })
        return Categories.findByIdAndUpdate(
          id,
          { $set: { _id: id, name, images, icons } },
          { new: true }
        )
      },
    },
  },
})

const Query = new GraphQLObjectType({
  name: "Query",
  fields: {
    productById: {
      type: ProductType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        return Products.findById(id)
      },
    },
    productByName: {
      type: new GraphQLList(ProductType),
      args: { name: { type: GraphQLString } },
      resolve(parent, { name }) {
        console.info("productByName:", name)
        return Products.find({ name: { $regex: name, $options: "i" } })
      },
    },
    categoryById: {
      type: CategoryType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        console.info("categoryById:", id)
        return Categories.findById(id)
      },
    },
    productsAll: {
      type: new GraphQLList(ProductType),
      resolve: () => {
        console.info("productsAll")
        return Products.find({})
      },
    },
    productsByCategoryId: {
      type: new GraphQLList(ProductType),
      args: { id: { type: GraphQLString } },
      resolve(parent, { id }) {
        return Products.find({ categories: id })
      },
    },
    categoryByName: {
      type: new GraphQLList(CategoryType),
      args: { name: { type: GraphQLString } },
      resolve(parent, { name }) {
        console.info("categoryByName:", name)
        return Categories.find({ name: { $regex: name, $options: "i" } })
      },
    },
    categoriesAll: {
      type: new GraphQLList(CategoryType),
      resolve: () => {
        console.info("categoriesAll")
        return Categories.find({})
      },
    },
    categoriesByListNames: {
      type: new GraphQLList(CategoryType),
      args: { names: { type: new GraphQLList(GraphQLString) } },
      resolve(parent, { names }) {
        console.info("categoriesByListNames :", names)
        return Categories.find({ name: { $in: names } })
      },
    },
    // products: {
    //   type: new GraphQLList(ProductType),
    //   args: {name: {type: GraphQLString}},
    //   resolve(parent, {name}) {
    //     return Products.find({name: {$regex: name, $options: "i"}});
    //   },
    // },

    // categories: {
    //   type: new GraphQLList(CategoryType),
    //   args: {name: {type: GraphQLString}},
    //   resolve(parent, {name}) {
    //     return Categories.find({name: {$regex: name, $options: "i"}});
    //   },
    // },
  },
})

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
})
