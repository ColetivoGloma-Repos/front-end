import React from "react";
import { Button, Select, Modal, Input, Textarea } from "../../components/common";
import { TableProducts } from "../../components/tables/table-products";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { listProductsByDistribuitionPoint } from "../../services/distribuition-points.service";
import { IProduct } from "../../interfaces/products";

interface IProductsInitialData {
  data: IProduct[];
  total: number;
}

const initialData = {
  data: [],
  total: 0,
};

function ProductsScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [products, setProducts] = React.useState<IProductsInitialData>(initialData);

  const load = async () => {
    try {
      setRequesting(true);
      const resp = await listProductsByDistribuitionPoint(id || "");

      console.log(resp);

      setProducts(resp);
    } catch (error) {
      console.error(error);
      navigate("/distribuition-points");
    } finally {
      setRequesting(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  if (requesting) {
    return <LoadingScreen />;
  }

  return (
    <div className="py-8">
      <div className="my-5">
        <p className="font-semibold">Filtrar por</p>
        <div
          className={`
            grid grid-cols-4 gap-3 py-2
          `}
        >
          <Select
            options={[
              { label: "teste", value: "teste" },
              { label: "teste", value: "teste" },
            ]}
          />
          <Select
            options={[
              { label: "teste", value: "teste" },
              { label: "teste", value: "teste" },
            ]}
          />

          <Button
            text="Nova necessidade"
            className="bg-black text-white w-full"
            onClick={() => setOpenModal(true)}
          />
        </div>
      </div>

      <div>
        <TableProducts
          dataSource={[
            {
              title: "teste",
              dataIndex: "",
            },
          ]}
        />
      </div>

      <Modal open={openModal} close={() => setOpenModal(false)}>
        <div className="p-4 pt-10">
          <form
            className={`
            grid grid-flow-row auto-rows-max
            gap-2
          `}
          >
            <Select
              label="Teste"
              options={[
                { label: "teste", value: "teste" },
                { label: "teste", value: "teste" },
              ]}
            />
            <Input label="Teste" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Teste" />

              <Input label="Teste" />
            </div>

            <Input label="Teste" />

            <Textarea label="Teste" />

            <Button text="Cadastrar" className="w-full mt-4 bg-black text-white" />
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default ProductsScreen;
