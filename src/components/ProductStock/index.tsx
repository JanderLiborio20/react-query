import { Clock, Add, Subtract } from "grommet-icons";
import { Box, Button, Text } from "grommet";
import { IProduct } from "../../types/IProduct";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { IState } from "../ProductsTable";

type ProductStockProps = {
  product: IProduct;
  queryKey: Array<string | number>;
};

async function updateProduct(product: IProduct) {
  const request = await axios.put(
    `http://localhost:3333/products/${product.id}`,
    product
  );

  return request.data;
}

export const ProductStock = ({ product, queryKey }: ProductStockProps) => {
  const isLoading = false;

  const queryClient = useQueryClient();

  const mutation = useMutation(updateProduct, {
    onMutate: async (updateProduct) => {
      await queryClient.cancelQueries(queryKey);

      const previousState = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<IState>(queryKey, (oldState) => {
        const newItem = oldState?.items.map((product) =>
          product.id === updateProduct.id ? updateProduct : product
        );

        return {
          total: oldState?.total,
          items: newItem ?? [],
        };
      });

      return { previousState };
    },

    onError: async (err, variable, context: any) => {
      queryClient.setQueryData(queryKey, context.previousState);
    },
    onSettled: async () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  function increment() {
    mutation.mutate({
      ...product,
      stock: product.stock + 1,
    });
  }

  function decrement() {
    mutation.mutate({
      ...product,
      stock: product.stock - 1,
    });
  }

  return (
    <Box direction="row" align="center">
      {mutation.isLoading ? <Clock size="small" /> : null}
      <Text>{product.stock}</Text>
      <Button size="small" icon={<Add size="small" />} onClick={increment} />
      <Button
        size="small"
        icon={<Subtract size="small" />}
        onClick={decrement}
      />
    </Box>
  );
};
