const graphql = require("graphql")
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
    categories: { type: new GraphQLList(GraphQLString) },
    icon: { type: GraphQLString },

    // categories: {
    //   type: new GraphQLList(CategoryType),
    //   resolve({ categories }, args) {
    //     return Categories.find({ _id: { $in: categories } }, (err, docs) => {
    //       console.log(docs)
    //     })
    //   },
    // },
  }),
})

const CategoryType = new GraphQLObjectType({
  name: "Category",
  fields: () => ({
    _id: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    parent: { type: GraphQLString },
    icons: { type: new GraphQLList(GraphQLString) },
    images: { type: new GraphQLList(GraphQLString) },

    // https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/
    // products: {
    //   type: new GraphQLList(ProductType),
    //   resolve({ products }, args) {
    //     return Products.find({ _id: { $in: products } }, (err, docs) => {
    //       console.log(docs)
    //     })
    //   },
    // },
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
      resolve(parent, { name, price, categories, images, icon }) {
        console.info("addProduct: ", { name, price, categories, images, icon })
        const product = new Products({
          name,
          price,
          categories,
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
    addProductsWithoutCategoryInWithoutCategory: {
      type: ProductType,
      resolve() {
        const predicate = { categories: [] }
        const projection = { categories: 1 }
        return Products.updateMany(
          predicate,
          { $addToSet: { categories: [process.env.WITHOUT_CATEGORY_ID] } },
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
      args: { _id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parent, { _id }) {
        console.info("deleteCascadeCategoryWithProductsById :", _id)
        return Products.deleteMany({
          categoryes: _id,
        }).then((res) => Categories.findByIdAndRemove(_id).then((mes) => mes))
      },
    },
    addCategory: {
      type: CategoryType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        parent: { type: GraphQLString },
        icons: { type: new GraphQLList(GraphQLString) },
        images: { type: new GraphQLList(GraphQLString) },
      },
      resolve(__, { _id, name, images, icons, parent }) {
        const category = new Categories({
          _id,
          name,
          images,
          icons,
          parent
        })
        // console.log("###############", category)

        // category._id = _id
        return category.save()
      },
    },
    // TODO:
    // https://stackoverflow.com/questions/4012855/how-update-the-id-of-one-mongodb-document
    updateCategory: {
      type: CategoryType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        parent: { type: GraphQLString },
        images: { type: new GraphQLList(GraphQLString) },
        icons: { type: new GraphQLList(GraphQLString) },
      },
      resolve(_, { _id, name, images, icons, parent }) {
        console.info("updateCategory :", {
          _id,
          name,
          images,
          icons,
          parent,
        })
        return Categories.findByIdAndUpdate(
          _id,
          { $set: { _id, name, images, icons, parent } },
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
    //ok
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
      args: { _id: { type: GraphQLString } },
      resolve(parent, { _id }) {
        console.info("categoryById:", _id)
        return Categories.findById(_id)
      },
    },

    categoriesByParentId: {
      type: new GraphQLList(CategoryType),
      args: { parent: { type: GraphQLString } },
      resolve(_, { parent }) {
        console.info("categoryById:", parent)
        return Categories.find({parent})
      },
    },

    productsAll: {
      type: new GraphQLList(ProductType),
      resolve: () => {
        console.info("productsAll")
        return Products.find({}).sort({_id: -1})
      },
    },
    productsByCategoryId: {
      type: new GraphQLList(ProductType),
      args: { id: { type: GraphQLString } },
      resolve(parent, { id }) {
        return Products.find({ categories: id }).sort({_id: -1})
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
        return Categories.find({}).sort({createdAt: -1})
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
