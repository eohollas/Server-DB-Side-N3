insert into proprietario (cpf, nome, fone) values
    ('52998224725', 'Ana Souza',        '(47) 99911-2233'),
    ('11144477735', 'Bruno Lima',       '(47) 98822-3344'),
    ('39053344705', 'Carla Mendes',     '(48) 99733-4455'),
    ('15350946056', 'Diego Ferreira',   '(41) 99644-5566'),
    ('71428793860', 'Eduarda Martins',  '(47) 99555-6677');

insert into veiculo (placa_veiculo, modelo_veiculo, preco_veiculo, cpf_proprietario, id_tipo) values
    ('abc-1d23', 'Fiat Mobi',              42000.00, '52998224725', 1),
    ('ABC2E34',  'Toyota Corolla',         98000.00, '52998224725', 2),
    ('BRA3F45',  'Porsche Macan',         520000.00, '52998224725', 3),
    ('qwe-4g56', 'Renault Kwid',           38000.00, '11144477735', 1),
    ('QWE5H67',  'Volkswagen Polo',        49900.00, '11144477735', 1),
    ('RTY6J78',  'Jeep Compass',           75000.00, '39053344705', 2),
    ('RTY7K89',  'BMW X1',                 99999.99, '39053344705', 2),
    ('UIO8L90',  'Mercedes-Benz C300',    350000.00, '39053344705', 3),
    ('UIO9M01',  'Chevrolet Onix',         45000.00, '15350946056', 1),
    ('PAS0N12',  'Audi A4',               100000.00, '15350946056', 3);
